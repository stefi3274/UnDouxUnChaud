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
    .select('id, sender_id, contenu, image_path, created_at, modifie_le, supprime, lu, repond_a')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  const idsReponses = [...new Set((messages || []).map((m) => m.repond_a).filter(Boolean))];
  let messagesOriginauxParId = {};
  if (idsReponses.length > 0) {
    const { data: originaux } = await supabaseAdmin
      .from('udc_messages')
      .select('id, contenu, sender_id, image_path, supprime')
      .in('id', idsReponses);
    messagesOriginauxParId = Object.fromEntries((originaux || []).map((o) => [o.id, o]));
  }

  const idsMessages = (messages || []).map((m) => m.id);
  const { data: reactions } = idsMessages.length > 0
    ? await supabaseAdmin.from('udc_message_reactions').select('message_id, user_id, emoji').in('message_id', idsMessages)
    : { data: [] };

  const messagesAvecImages = await Promise.all(
    (messages || []).map(async (m) => {
      const imageUrl = m.image_path
        ? (await supabaseAdmin.storage.from('messages-images').createSignedUrl(m.image_path, 3600)).data?.signedUrl || null
        : null;

      const reactionsDuMessage = (reactions || []).filter((r) => r.message_id === m.id);
      const compteParEmoji = {};
      let maReaction = null;
      for (const r of reactionsDuMessage) {
        compteParEmoji[r.emoji] = (compteParEmoji[r.emoji] || 0) + 1;
        if (r.user_id === user.id) maReaction = r.emoji;
      }

      return {
        ...m,
        imageUrl,
        messageOriginal: m.repond_a ? messagesOriginauxParId[m.repond_a] || null : null,
        reactions: Object.entries(compteParEmoji).map(([emoji, total]) => ({ emoji, total })),
        maReaction,
      };
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

  const { contenu, repond_a } = await request.json();
  if (!contenu?.trim()) {
    return NextResponse.json({ error: 'Message vide.' }, { status: 400 });
  }
  if (contenu.length > 4000) {
    return NextResponse.json({ error: 'Message trop long.' }, { status: 400 });
  }

  const autreId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;

  const [{ autorise }, { data: blocage }] = await Promise.all([
    verifierLimite(`message:${user.id}`, 30, 5),
    supabaseAdmin
      .from('udc_blocks')
      .select('id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${autreId}),and(blocker_id.eq.${autreId},blocked_id.eq.${user.id})`)
      .maybeSingle(),
  ]);

  if (!autorise) {
    return NextResponse.json({ error: 'Trop de messages envoyés. Ralentis un peu.' }, { status: 429 });
  }
  if (blocage) {
    return NextResponse.json({ error: 'Conversation bloquée.' }, { status: 403 });
  }

  let repondAValide = null;
  if (repond_a) {
    const { data: original } = await supabaseAdmin
      .from('udc_messages')
      .select('id')
      .eq('id', repond_a)
      .eq('conversation_id', params.id)
      .maybeSingle();
    if (original) repondAValide = original.id;
  }

  const { data: message, error } = await supabaseAdmin
    .from('udc_messages')
    .insert({ conversation_id: params.id, sender_id: user.id, contenu: contenu.trim(), repond_a: repondAValide })
    .select('id, sender_id, contenu, created_at, lu, repond_a')
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'envoi." }, { status: 500 });
  }

  let messageOriginal = null;
  if (repondAValide) {
    const { data: original } = await supabaseAdmin
      .from('udc_messages')
      .select('id, contenu, sender_id, image_path, supprime')
      .eq('id', repondAValide)
      .maybeSingle();
    messageOriginal = original || null;
  }

  return NextResponse.json({ message: { ...message, imageUrl: null, messageOriginal, reactions: [], maReaction: null } });
}

export async function DELETE(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const conversation = await verifierAcces(params.id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
  }

  // Suppression définitive : on efface d'abord les images stockées,
  // puis la conversation elle-même (les messages, verrous et
  // réactions liés sont supprimés automatiquement en cascade).
  const { data: messagesAvecImages } = await supabaseAdmin
    .from('udc_messages')
    .select('image_path')
    .eq('conversation_id', params.id)
    .not('image_path', 'is', null);

  const chemins = (messagesAvecImages || []).map((m) => m.image_path).filter(Boolean);
  if (chemins.length > 0) {
    await supabaseAdmin.storage.from('messages-images').remove(chemins);
  }

  const { error } = await supabaseAdmin
    .from('udc_conversations')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
