import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { creerNotification } from '@/lib/notifications';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const { auteur_id } = await request.json();
  if (!auteur_id || auteur_id === user.id) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const { data: existant } = await supabaseAdmin
    .from('udc_follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('followed_id', auteur_id)
    .maybeSingle();

  if (existant) {
    await supabaseAdmin.from('udc_follows').delete().eq('id', existant.id);
    return NextResponse.json({ suivi: false });
  }

  await supabaseAdmin.from('udc_follows').insert({ follower_id: user.id, followed_id: auteur_id });
  await creerNotification({ user_id: auteur_id, type: 'nouvel_abonne', acteur_id: user.id });

  return NextResponse.json({ suivi: true });
}
