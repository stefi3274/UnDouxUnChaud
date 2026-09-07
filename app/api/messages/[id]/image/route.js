import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { verifierLimite } from '@/lib/rateLimit';

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo (déjà compressée côté navigateur avant envoi)
const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];

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

export async function POST(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const conversation = await verifierAcces(params.id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
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

  const { autorise } = await verifierLimite(`message-image:${user.id}`, 20, 5);
  if (!autorise) {
    return NextResponse.json({ error: 'Trop d\'images envoyées. Ralentis un peu.' }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const legende = formData.get('legende')?.toString().trim() || null;

  if (!file) {
    return NextResponse.json({ error: 'Aucune image reçue.' }, { status: 400 });
  }
  if (!TYPES_AUTORISES.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté (JPG, PNG ou WEBP).' }, { status: 400 });
  }
  if (file.size > TAILLE_MAX) {
    return NextResponse.json({ error: 'Image trop lourde.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const chemin = `${params.id}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('messages-images')
    .upload(chemin, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'image." }, { status: 500 });
  }

  const { data: message, error } = await supabaseAdmin
    .from('udc_messages')
    .insert({ conversation_id: params.id, sender_id: user.id, contenu: legende || '', image_path: chemin })
    .select('id, sender_id, contenu, image_path, created_at, lu')
    .single();

  if (error) {
    await supabaseAdmin.storage.from('messages-images').remove([chemin]);
    return NextResponse.json({ error: "Erreur lors de l'envoi." }, { status: 500 });
  }

  const { data: signed } = await supabaseAdmin.storage.from('messages-images').createSignedUrl(chemin, 3600);

  return NextResponse.json({ message: { ...message, imageUrl: signed?.signedUrl || null, messageOriginal: null, reactions: [], maReaction: null } });
}
