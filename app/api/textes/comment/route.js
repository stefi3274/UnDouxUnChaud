import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { verifierLimite } from '@/lib/rateLimit';
import { creerNotification } from '@/lib/notifications';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const { texte_id, contenu, parent_id } = await request.json();
  if (!texte_id || !contenu || !contenu.trim()) {
    return NextResponse.json({ error: 'texte_id et contenu requis.' }, { status: 400 });
  }
  if (contenu.length > 2000) {
    return NextResponse.json({ error: 'Commentaire trop long (2000 caractères maximum).' }, { status: 400 });
  }

  const { autorise } = await verifierLimite(`comment:${user.id}`, 20, 5);
  if (!autorise) {
    return NextResponse.json({ error: 'Trop de commentaires envoyés. Ralentis un peu.' }, { status: 429 });
  }

  const { data: commentaire, error } = await supabaseAdmin
    .from('udc_commentaires')
    .insert({
      texte_id,
      user_id: user.id,
      contenu: contenu.trim(),
      parent_id: parent_id || null,
    })
    .select('id, contenu, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'envoi du commentaire." }, { status: 500 });
  }

  const { data: texte } = await supabaseAdmin.from('udc_textes').select('user_id').eq('id', texte_id).maybeSingle();
  if (texte) {
    await creerNotification({ user_id: texte.user_id, type: 'commentaire', texte_id, acteur_id: user.id });
  }

  return NextResponse.json({ commentaire });
}
