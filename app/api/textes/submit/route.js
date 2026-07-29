import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const CATEGORIES_VALIDES = ['un_doux', 'un_chaud', 'piment', 'piquant', 'poemes'];

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const body = await request.json();
  const {
    titre, contenu, categorie,
    orientation_hh, orientation_ff,
    tags, avertissements,
    image_url, image_credit, serie_titre, chapitre_numero,
    consentement_certifie,
  } = body;

  if (!titre || !contenu || !categorie) {
    return NextResponse.json({ error: 'Titre, texte et catégorie sont requis.' }, { status: 400 });
  }
  const wordCount = contenu.trim().split(/\s+/).filter(Boolean).length;
  if (categorie === 'poemes' && wordCount < 100) {
    return NextResponse.json({ error: 'Un poème doit faire au moins 100 mots.' }, { status: 400 });
  }
  if (!CATEGORIES_VALIDES.includes(categorie)) {
    return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 });
  }
  if (!consentement_certifie) {
    return NextResponse.json({ error: 'La certification de consentement est obligatoire.' }, { status: 400 });
  }

  const { data: texte, error } = await supabaseAdmin
    .from('udc_textes')
    .insert({
      user_id: user.id,
      titre,
      contenu,
      categorie,
      orientation_hh: !!orientation_hh,
      orientation_ff: !!orientation_ff,
      tags: tags || [],
      avertissements: avertissements || [],
      image_url: image_url || null,
      image_credit: image_credit || null,
      serie_titre: serie_titre || null,
      chapitre_numero: chapitre_numero || null,
      consentement_certifie: true,
      statut: 'en_attente',
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la soumission.' }, { status: 500 });
  }

  return NextResponse.json({ texte });
}
