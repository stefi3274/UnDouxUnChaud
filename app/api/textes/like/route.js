import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { creerNotification } from '@/lib/notifications';

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

  const { data: texte } = await supabaseAdmin.from('udc_textes').select('user_id').eq('id', texte_id).maybeSingle();
  if (texte) {
    await creerNotification({ user_id: texte.user_id, type: 'like', texte_id, acteur_id: user.id });
  }

  return NextResponse.json({ liked: true });
}
