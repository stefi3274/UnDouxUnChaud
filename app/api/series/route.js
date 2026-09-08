import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const TABLES = { texte: 'udc_textes', photo: 'udc_photos', audio: 'udc_audios' };

export async function GET(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get('type');
  const table = TABLES[type];
  if (!table) {
    return NextResponse.json({ error: 'Type invalide.' }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from(table)
    .select('serie_titre, chapitre_numero')
    .eq('user_id', user.id)
    .not('serie_titre', 'is', null);

  const parSerie = {};
  for (const ligne of data || []) {
    const titre = ligne.serie_titre;
    const num = ligne.chapitre_numero || 0;
    if (!parSerie[titre] || num > parSerie[titre]) parSerie[titre] = num;
  }

  const series = Object.entries(parSerie)
    .map(([titre, dernierChapitre]) => ({ titre, prochainChapitre: dernierChapitre + 1 }))
    .sort((a, b) => a.titre.localeCompare(b.titre));

  return NextResponse.json({ series });
}
