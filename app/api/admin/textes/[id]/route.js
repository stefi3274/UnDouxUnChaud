import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

// Supprime définitivement un texte publié (ou en file d'attente), ainsi que
// tout ce qui en dépend : commentaires, likes, notes, notifications et
// l'image associée dans le storage. Admin uniquement.
export async function DELETE(request, { params }) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const texteId = params.id;

  const { data: texte } = await supabaseAdmin
    .from('udc_textes')
    .select('id, image_url')
    .eq('id', texteId)
    .maybeSingle();

  if (!texte) {
    return NextResponse.json({ error: 'Texte introuvable.' }, { status: 404 });
  }

  await Promise.all([
    supabaseAdmin.from('udc_commentaires').delete().eq('texte_id', texteId),
    supabaseAdmin.from('udc_likes').delete().eq('texte_id', texteId),
    supabaseAdmin.from('udc_notes').delete().eq('texte_id', texteId),
    supabaseAdmin.from('udc_notifications').delete().eq('texte_id', texteId),
  ]);

  if (texte.image_url) {
    await supabaseAdmin.storage.from('textes-images').remove([texte.image_url]);
  }

  const { error } = await supabaseAdmin.from('udc_textes').delete().eq('id', texteId);
  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
