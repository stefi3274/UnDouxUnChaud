import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const { data: notifications } = await supabaseAdmin
    .from('udc_notifications')
    .select('id, type, texte_id, acteur_id, lu, created_at, udc_textes(titre), acteur:acteur_id(pseudo)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ notifications: notifications || [] });
}

export async function POST() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  await supabaseAdmin.from('udc_notifications').update({ lu: true }).eq('user_id', user.id).eq('lu', false);
  return NextResponse.json({ ok: true });
}
