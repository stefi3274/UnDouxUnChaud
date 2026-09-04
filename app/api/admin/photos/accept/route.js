import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { photo_id } = await request.json();
  if (!photo_id) {
    return NextResponse.json({ error: 'photo_id requis.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('udc_photos')
    .update({ statut: 'accepte', date_decision: now, date_publication: now, raison_refus: null })
    .eq('id', photo_id);

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'acceptation." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
