import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const EMPLACEMENTS_VALIDES = ['fil', 'banniere'];

export async function GET() {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('udc_ads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erreur de chargement.' }, { status: 500 });
  }
  return NextResponse.json({ ads: data });
}

export async function POST(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { titre, description, image_path, lien, emplacement, ordre } = await request.json();

  if (!titre || !lien) {
    return NextResponse.json({ error: 'Titre et lien sont requis.' }, { status: 400 });
  }
  if (!EMPLACEMENTS_VALIDES.includes(emplacement)) {
    return NextResponse.json({ error: 'Emplacement invalide.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('udc_ads')
    .insert({
      titre,
      description: description || null,
      image_path: image_path || null,
      lien,
      emplacement,
      ordre: Number.isFinite(ordre) ? ordre : 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la création de la pub." }, { status: 500 });
  }
  return NextResponse.json({ ad: data });
}
