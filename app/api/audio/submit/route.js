import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { verifierLimite } from '@/lib/rateLimit';

const CATEGORIES_VALIDES = ['un_doux', 'un_chaud', 'piment', 'piquant', 'poemes'];

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connecte-toi pour proposer un audio.' }, { status: 401 });
  }

  const { autorise } = await verifierLimite(`audio-submit:${user.id}`, 10, 60);
  if (!autorise) {
    return NextResponse.json({ error: 'Trop d\'audios envoyés récemment. Réessaie plus tard.' }, { status: 429 });
  }

  const { titre, description, categorie, audio_path, duree_secondes, serie_titre, chapitre_numero } = await request.json();

  if (!titre?.trim() || !audio_path) {
    return NextResponse.json({ error: 'Titre et fichier audio requis.' }, { status: 400 });
  }
  if (titre.trim().length > 150) {
    return NextResponse.json({ error: 'Le titre est trop long (150 caractères maximum).' }, { status: 400 });
  }
  if (!CATEGORIES_VALIDES.includes(categorie)) {
    return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 });
  }

  const serieTitre = serie_titre?.trim() || null;
  const chapitreNumero = serieTitre && Number.isFinite(chapitre_numero) ? Math.round(chapitre_numero) : null;

  const { error } = await supabaseAdmin.from('udc_audios').insert({
    titre: titre.trim(),
    description: description?.trim() || null,
    categorie,
    audio_path,
    duree_secondes: Number.isFinite(duree_secondes) ? Math.round(duree_secondes) : null,
    user_id: user.id,
    statut: 'en_attente',
    serie_titre: serieTitre,
    chapitre_numero: chapitreNumero,
  });

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
