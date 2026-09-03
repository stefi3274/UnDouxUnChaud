import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function GET(request, { params }) {
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

  const autreId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;

  const [{ data: autreUser }, { data: verrou }, { data: utilisateur }] = await Promise.all([
    supabaseAdmin.from('udc_users').select('pseudo').eq('id', autreId).maybeSingle(),
    supabaseAdmin.from('udc_conversation_locks').select('id').eq('user_id', user.id).eq('conversation_id', params.id).maybeSingle(),
    supabaseAdmin.from('udc_users').select('lock_pin_hash, lock_type').eq('id', user.id).maybeSingle(),
  ]);

  return NextResponse.json({
    autreUtilisateur: { id: autreId, pseudo: autreUser?.pseudo },
    verrouillee: !!verrou,
    aPinDefini: !!utilisateur?.lock_pin_hash,
    typeVerrou: utilisateur?.lock_type || 'pin',
  });
}
