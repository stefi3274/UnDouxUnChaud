import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { verifierLimite } from '@/lib/rateLimit';

async function verifierAcces(conversationId, userId) {
  const { data: conversation } = await supabaseAdmin
    .from('udc_conversations')
    .select('id, user1_id, user2_id')
    .eq('id', conversationId)
    .maybeSingle();

  if (!conversation) return null;
  if (conversation.user1_id !== userId && conversation.user2_id !== userId) return null;
  return conversation;
}

export async function GET(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const conversation = await verifierAcces(params.id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
  }

  const autreId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
  const { data: autreUser } = await supabaseAdmin
    .from('udc_users')
    .select('pseudo')
    .eq('id', autreId)
    .maybeSingle();

  const { data: messages } = await supabaseAdmin
    .from('udc_messages')
    .select('id, sender_id, contenu, image_path, created_at, lu')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  const messagesAvecImages = await Promise.all(
    (messages || []).map(async (m) => {
      if (!m.image_path) return { ...m, imageUrl: null };
      const { data: signed } = await supabaseAdmin.storage
        .from('messages-images')
        .createSignedUrl(m.image_path, 3600);
      return { ...m, imageUrl: signed?.signedUrl || null };
    })
  );

  // Marque comme lus les messages reçus (pas les nôtres).
  await supabaseAdmin
    .from('udc_messages')
    .update({ lu: true })
    .eq('conversation_id', params.id)
    .neq('sender_id', user.id)
    .eq('lu', false);

  return NextResponse.json({
    messages: messagesAvecImages,
    autreUtilisateur: { id: autreId, pseudo: autreUser?.pseudo },
    moi: user.id,
  });
}

export async function POST(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const conversation = await verifierAcces(params.id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
  }

  const { contenu } = await request.json();
  if (!contenu?.trim()) {
    return NextResponse.json({ error: 'Message vide.' }, { status: 400 });
  }
  if (contenu.length > 4000) {
    return NextResponse.json({ error: 'Message trop long.' }, { status: 400 });
  }

  const { autorise } = await verifierLimite(`message:${user.id}`, 30, 5);
  if (!autorise) {
    return NextResponse.json({ error: 'Trop de messages envoyés. Ralentis un peu.' }, { status: 429 });
  }

  const autreId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
  const { data: blocage } = await supabaseAdmin
    .from('udc_blocks')
    .select('id')
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${autreId}),and(blocker_id.eq.${autreId},blocked_id.eq.${user.id})`)
    .maybeSingle();

  if (blocage) {
    return NextResponse.json({ error: 'Conversation bloquée.' }, { status: 403 });
  }

  const { data: message, error } = await supabaseAdmin
    .from('udc_messages')
    .insert({ conversation_id: params.id, sender_id: user.id, contenu: contenu.trim() })
    .select('id, sender_id, contenu, created_at, lu')
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'envoi." }, { status: 500 });
  }

  return NextResponse.json({ message });
}
