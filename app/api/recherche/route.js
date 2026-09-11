import { NextResponse } from 'next/server';
import { supabasePublic } from '@/lib/supabase';

export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ textes: [] });
  }

  const { data } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, contenu, categorie, langue, date_publication, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .or(`titre.ilike.%${q}%,contenu.ilike.%${q}%`)
    .order('date_publication', { ascending: false })
    .limit(30);

  return NextResponse.json({ textes: data || [] });
}
