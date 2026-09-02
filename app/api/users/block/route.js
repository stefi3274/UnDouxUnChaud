import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { user_id } = await request.json();
  if (!user_id || user_id === user.id) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('udc_blocks')
    .upsert({ blocker_id: user.id, blocked_id: user_id }, { onConflict: 'blocker_id,blocked_id' });

  if (error) {
    return NextResponse.json({ error: 'Erreur lors du blocage.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
