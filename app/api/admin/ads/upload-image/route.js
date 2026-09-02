import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo
const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
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
  const chemin = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('pubs-images')
    .upload(chemin, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'image." }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from('pubs-images').getPublicUrl(chemin);

  return NextResponse.json({ path: chemin, url: data.publicUrl });
}
