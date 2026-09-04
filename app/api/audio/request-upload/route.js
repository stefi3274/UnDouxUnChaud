import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connecte-toi pour proposer un audio.' }, { status: 401 });
  }

  const { extension } = await request.json();
  const ext = ['mp3', 'm4a', 'wav', 'ogg'].includes(extension) ? extension : 'mp3';
  const chemin = `${user.id}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from('audios-files')
    .createSignedUploadUrl(chemin);

  if (error) {
    return NextResponse.json({ error: "Impossible de préparer l'envoi." }, { status: 500 });
  }

  return NextResponse.json({ path: chemin, token: data.token });
}
