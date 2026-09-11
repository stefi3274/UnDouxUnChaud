import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { count } = await supabaseAdmin
    .from('udc_textes')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'accepte');

  if (!count) {
    return NextResponse.json({ error: 'Aucun texte disponible.' }, { status: 404 });
  }

  const decalage = Math.floor(Math.random() * count);
  const { data } = await supabaseAdmin
    .from('udc_textes')
    .select('id')
    .eq('statut', 'accepte')
    .range(decalage, decalage)
    .limit(1)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: 'Aucun texte disponible.' }, { status: 404 });
  }
  return NextResponse.json({ id: data.id });
}
