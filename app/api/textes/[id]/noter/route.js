import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { obtenirIdentifiant } from '@/lib/visiteur';
import { verifierLimite } from '@/lib/rateLimit';

export async function POST(request, { params }) {
  const { note } = await request.json();
  const noteNombre = Number(note);

  if (!Number.isInteger(noteNombre) || noteNombre < 1 || noteNombre > 5) {
    return NextResponse.json({ error: 'Note invalide (1 à 5).' }, { status: 400 });
  }

  const identifiant = obtenirIdentifiant();
  const texteId = params.id;

  const { autorise } = await verifierLimite(`vote:${identifiant}`, 40, 5);
  if (!autorise) {
    return NextResponse.json({ error: 'Trop de votes. Ralentis un peu.' }, { status: 429 });
  }

  const { error } = await supabaseAdmin
    .from('udc_notes')
    .upsert(
      { texte_id: texteId, identifiant, note: noteNombre, updated_at: new Date().toISOString() },
      { onConflict: 'texte_id,identifiant' }
    );

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du vote." }, { status: 500 });
  }

  const { data: toutesLesNotes } = await supabaseAdmin
    .from('udc_notes')
    .select('note')
    .eq('texte_id', texteId);

  const total = toutesLesNotes?.length || 0;
  const moyenne = total > 0 ? toutesLesNotes.reduce((s, n) => s + n.note, 0) / total : 0;

  return NextResponse.json({ ok: true, moyenne, total, maNote: noteNombre });
}

export async function GET(request, { params }) {
  const identifiant = obtenirIdentifiant();
  const texteId = params.id;

  const { data: toutesLesNotes } = await supabaseAdmin
    .from('udc_notes')
    .select('note, identifiant')
    .eq('texte_id', texteId);

  const total = toutesLesNotes?.length || 0;
  const moyenne = total > 0 ? toutesLesNotes.reduce((s, n) => s + n.note, 0) / total : 0;
  const maNote = toutesLesNotes?.find((n) => n.identifiant === identifiant)?.note || 0;

  return NextResponse.json({ moyenne, total, maNote });
}
