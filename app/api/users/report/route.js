import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { user_id, conversation_id, raison } = await request.json();
  if (!user_id) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('udc_signalements')
    .insert({
      reporter_id: user.id,
      reported_id: user_id,
      conversation_id: conversation_id || null,
      raison: raison?.trim() || null,
    });

  if (error) {
    return NextResponse.json({ error: 'Erreur lors du signalement.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
