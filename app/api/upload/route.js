import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo
const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }
  if (!TYPES_AUTORISES.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté (JPG, PNG ou WEBP uniquement).' }, { status: 400 });
  }
  if (file.size > TAILLE_MAX) {
    return NextResponse.json({ error: 'Image trop lourde (5 Mo maximum).' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const chemin = `${user.id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('textes-images')
    .upload(chemin, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'image." }, { status: 500 });
  }

  // On renvoie le chemin (pas d'URL publique) : le bucket est privé,
  // l'image ne sera accessible que via une URL signée générée au moment
  // de l'affichage, uniquement pour les textes acceptés.
  return NextResponse.json({ path: chemin });
}
