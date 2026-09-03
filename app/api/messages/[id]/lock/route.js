import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { data: conversation } = await supabaseAdmin
    .from('udc_conversations')
    .select('id, user1_id, user2_id')
    .eq('id', params.id)
    .maybeSingle();

  if (!conversation || (conversation.user1_id !== user.id && conversation.user2_id !== user.id)) {
    return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
  }

  const { verrouille } = await request.json();

  if (verrouille) {
    const { data: utilisateur } = await supabaseAdmin
      .from('udc_users')
      .select('lock_pin_hash')
      .eq('id', user.id)
      .maybeSingle();
    if (!utilisateur?.lock_pin_hash) {
      return NextResponse.json({ error: 'Crée d\'abord un code de verrouillage.', codeRequis: true }, { status: 400 });
    }
    await supabaseAdmin
      .from('udc_conversation_locks')
      .upsert({ user_id: user.id, conversation_id: params.id }, { onConflict: 'user_id,conversation_id' });
  } else {
    await supabaseAdmin
      .from('udc_conversation_locks')
      .delete()
      .eq('user_id', user.id)
      .eq('conversation_id', params.id);
  }

  return NextResponse.json({ ok: true });
}
