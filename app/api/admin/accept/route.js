import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { creerNotification } from '@/lib/notifications';

export async function POST(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { texte_id } = await request.json();
  if (!texte_id) {
    return NextResponse.json({ error: 'texte_id requis.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data: texte, error } = await supabaseAdmin
    .from('udc_textes')
    .update({ statut: 'accepte', date_decision: now, date_publication: now, raison_refus: null })
    .eq('id', texte_id)
    .select('id, user_id')
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'acceptation." }, { status: 500 });
  }

  // Prévient les abonné·e·s de l'auteur·rice de cette nouvelle publication.
  const { data: abonnes } = await supabaseAdmin
    .from('udc_follows')
    .select('follower_id')
    .eq('followed_id', texte.user_id);

  await Promise.all(
    (abonnes || []).map((a) =>
      creerNotification({ user_id: a.follower_id, type: 'nouveau_texte', texte_id: texte.id, acteur_id: texte.user_id })
    )
  );

  return NextResponse.json({ ok: true });
}
