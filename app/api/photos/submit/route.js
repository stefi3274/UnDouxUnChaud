import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const TAILLE_MAX = 8 * 1024 * 1024; // 8 Mo
const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
const CATEGORIES_VALIDES = ['un_doux', 'un_chaud', 'piment', 'piquant'];

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connecte-toi pour proposer une photo.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const titre = formData.get('titre')?.toString().trim() || null;
  const description = formData.get('description')?.toString().trim() || null;
  const categorie = formData.get('categorie')?.toString();
  const consentementDroits = formData.get('consentement_droits') === 'true';
  const consentementMajeur = formData.get('consentement_majeur') === 'true';
  const publierDirect = formData.get('publier_direct') === 'true' && user.role === 'admin';

  if (!file) {
    return NextResponse.json({ error: 'Aucune image reçue.' }, { status: 400 });
  }
  if (!TYPES_AUTORISES.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté (JPG, PNG ou WEBP uniquement).' }, { status: 400 });
  }
  if (file.size > TAILLE_MAX) {
    return NextResponse.json({ error: 'Image trop lourde (8 Mo maximum).' }, { status: 400 });
  }
  if (!CATEGORIES_VALIDES.includes(categorie)) {
    return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 });
  }
  if (!consentementDroits || !consentementMajeur) {
    return NextResponse.json({ error: 'Les deux confirmations sont obligatoires pour envoyer une photo.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const chemin = `${user.id}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('photos-images')
    .upload(chemin, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'image." }, { status: 500 });
  }

  const maintenant = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin.from('udc_photos').insert({
    titre,
    description,
    categorie,
    image_path: chemin,
    source: publierDirect ? 'admin' : 'communaute',
    user_id: user.id,
    statut: publierDirect ? 'accepte' : 'en_attente',
    consentement_droits: consentementDroits,
    consentement_majeur: consentementMajeur,
    date_decision: publierDirect ? maintenant : null,
    date_publication: publierDirect ? maintenant : null,
  });

  if (insertError) {
    await supabaseAdmin.storage.from('photos-images').remove([chemin]);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, publiee: publierDirect });
}
