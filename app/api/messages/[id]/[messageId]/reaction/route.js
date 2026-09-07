import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { data: message } = await supabaseAdmin
    .from('udc_messages')
    .select('id, conversation_id')
    .eq('id', params.messageId)
    .maybeSingle();
  if (!message || message.conversation_id !== params.id) {
    return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 });
  }

  const { data: conversation } = await supabaseAdmin
    .from('udc_conversations')
    .select('user1_id, user2_id')
    .eq('id', params.id)
    .maybeSingle();
  if (!conversation || (conversation.user1_id !== user.id && conversation.user2_id !== user.id)) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { emoji } = await request.json();
  if (!emoji || typeof emoji !== 'string' || emoji.length > 8) {
    return NextResponse.json({ error: 'Emoji invalide.' }, { status: 400 });
  }

  const { data: existante } = await supabaseAdmin
    .from('udc_message_reactions')
    .select('id, emoji')
    .eq('message_id', params.messageId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existante && existante.emoji === emoji) {
    // Cliquer sur la même réaction la retire.
    await supabaseAdmin.from('udc_message_reactions').delete().eq('id', existante.id);
    return NextResponse.json({ ok: true, retiree: true });
  }

  const { error } = await supabaseAdmin
    .from('udc_message_reactions')
    .upsert(
      { message_id: params.messageId, user_id: user.id, emoji },
      { onConflict: 'message_id,user_id' }
    );

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, retiree: false });
}
