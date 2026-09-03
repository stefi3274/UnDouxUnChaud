import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const TAILLE_MAX = 4 * 1024 * 1024; // 4 Mo
const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
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
    return NextResponse.json({ error: 'Image trop lourde (4 Mo maximum).' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const chemin = `${user.id}-${Date.now()}.${extension}`;

  const { data: ancien } = await supabaseAdmin.from('udc_users').select('avatar_path').eq('id', user.id).maybeSingle();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('avatars-images')
    .upload(chemin, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'image." }, { status: 500 });
  }

  await supabaseAdmin.from('udc_users').update({ avatar_path: chemin }).eq('id', user.id);

  if (ancien?.avatar_path) {
    await supabaseAdmin.storage.from('avatars-images').remove([ancien.avatar_path]);
  }

  const { data } = supabaseAdmin.storage.from('avatars-images').getPublicUrl(chemin);
  return NextResponse.json({ url: data.publicUrl });
}

export async function DELETE() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { data: ancien } = await supabaseAdmin.from('udc_users').select('avatar_path').eq('id', user.id).maybeSingle();
  await supabaseAdmin.from('udc_users').update({ avatar_path: null }).eq('id', user.id);

  if (ancien?.avatar_path) {
    await supabaseAdmin.storage.from('avatars-images').remove([ancien.avatar_path]);
  }

  return NextResponse.json({ ok: true });
}
