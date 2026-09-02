import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function GET(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const texteId = searchParams.get('id');
  if (!texteId) {
    return NextResponse.json({ error: 'Paramètre id manquant.' }, { status: 400 });
  }

  const { data: texte } = await supabaseAdmin
    .from('udc_textes')
    .select('image_url')
    .eq('id', texteId)
    .maybeSingle();

  if (!texte?.image_url) {
    return NextResponse.json({ dataUrl: null });
  }

  const { data: fichier, error } = await supabaseAdmin.storage
    .from('textes-images')
    .download(texte.image_url);

  if (error || !fichier) {
    return NextResponse.json({ error: "Impossible de récupérer l'image." }, { status: 500 });
  }

  const arrayBuffer = await fichier.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mime = fichier.type || 'image/jpeg';

  // Encodée en base64 : le canvas la lit comme une image locale,
  // aucune requête cross-origin, donc aucun risque de blocage CORS
  // au moment du téléchargement du visuel.
  return NextResponse.json({ dataUrl: `data:${mime};base64,${base64}` });
}
