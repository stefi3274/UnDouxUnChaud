import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { data } = await supabaseAdmin.from('udc_concours').select('*').order('date_debut', { ascending: false });
  return NextResponse.json({ concours: data || [] });
}

export async function POST(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { titre, theme, description, date_debut, date_fin } = await request.json();
  if (!titre?.trim() || !date_debut || !date_fin) {
    return NextResponse.json({ error: 'Titre, date de début et date de fin sont requis.' }, { status: 400 });
  }
  if (new Date(date_fin) <= new Date(date_debut)) {
    return NextResponse.json({ error: 'La date de fin doit être après la date de début.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('udc_concours')
    .insert({ titre: titre.trim(), theme: theme?.trim() || null, description: description?.trim() || null, date_debut, date_fin })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 });
  }
  return NextResponse.json({ concours: data });
}
