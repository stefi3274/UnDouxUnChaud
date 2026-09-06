import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { texte_id, coup_de_coeur } = await request.json();
  if (!texte_id) {
    return NextResponse.json({ error: 'texte_id requis.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('udc_textes')
    .update({ coup_de_coeur: !!coup_de_coeur })
    .eq('id', texte_id);

  if (error) {
    return NextResponse.json({ error: 'Erreur de mise à jour.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
