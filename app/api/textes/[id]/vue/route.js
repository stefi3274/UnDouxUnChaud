import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { obtenirIdentifiant } from '@/lib/visiteur';
import { verifierLimite, obtenirIp } from '@/lib/rateLimit';

export async function POST(request, { params }) {
  const identifiant = obtenirIdentifiant();
  const texteId = params.id;
  const ip = obtenirIp(request);
  const maintenant = new Date();
  const seuil = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const { data: texte } = await supabaseAdmin.from('udc_textes').select('user_id').eq('id', texteId).maybeSingle();
  if (!texte) {
    return NextResponse.json({ error: 'Texte introuvable.' }, { status: 404 });
  }
  if (identifiant === `user:${texte.user_id}`) {
    // L'auteur·rice qui lit son propre texte ne gonfle pas son compteur.
    return NextResponse.json({ comptee: false });
  }

  // Limite par IP, en plus du cookie/compte : ralentit fortement une
  // tentative de gonfler les vues via navigation privée répétée.
  const { autorise } = await verifierLimite(`vue-ip:${ip}`, 150, 10);
  if (!autorise) {
    return NextResponse.json({ comptee: false });
  }

  const { data: vueExistante } = await supabaseAdmin
    .from('udc_vues')
    .select('id, vu_le')
    .eq('texte_id', texteId)
    .eq('identifiant', identifiant)
    .maybeSingle();

  if (vueExistante && vueExistante.vu_le > seuil) {
    // Déjà comptée dans les dernières 24h : on ne recompte pas.
    return NextResponse.json({ comptee: false });
  }

  if (vueExistante) {
    await supabaseAdmin.from('udc_vues').update({ vu_le: maintenant.toISOString(), ip }).eq('id', vueExistante.id);
  } else {
    await supabaseAdmin.from('udc_vues').insert({ texte_id: texteId, identifiant, vu_le: maintenant.toISOString(), ip });
  }

  await supabaseAdmin.rpc('increment_vues', { texte_id: texteId });

  return NextResponse.json({ comptee: true });
}
