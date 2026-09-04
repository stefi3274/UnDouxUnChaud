import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { audio_id, raison } = await request.json();
  if (!audio_id || !raison) {
    return NextResponse.json({ error: 'audio_id et raison requis.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('udc_audios')
    .update({ statut: 'refuse', raison_refus: raison, date_decision: new Date().toISOString() })
    .eq('id', audio_id);

  if (error) {
    return NextResponse.json({ error: 'Erreur lors du refus.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
