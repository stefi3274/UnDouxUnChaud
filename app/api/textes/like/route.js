import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

// Toggle : si le like existe déjà pour cet utilisateur, on le retire,
// sinon on l'ajoute. Évite d'avoir besoin de deux routes séparées.
export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const { texte_id } = await request.json();
  if (!texte_id) {
    return NextResponse.json({ error: 'texte_id requis.' }, { status: 400 });
  }

  const { data: likeExistant } = await supabaseAdmin
    .from('udc_likes')
    .select('id')
    .eq('texte_id', texte_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (likeExistant) {
    await supabaseAdmin.from('udc_likes').delete().eq('id', likeExistant.id);
    return NextResponse.json({ liked: false });
  }

  await supabaseAdmin.from('udc_likes').insert({ texte_id, user_id: user.id });
  return NextResponse.json({ liked: true });
}
