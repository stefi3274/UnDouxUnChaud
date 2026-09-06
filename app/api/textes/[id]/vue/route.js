import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { obtenirIdentifiant } from '@/lib/visiteur';

export async function POST(request, { params }) {
  const identifiant = obtenirIdentifiant();
  const texteId = params.id;
  const maintenant = new Date();
  const seuil = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000).toISOString();

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
    await supabaseAdmin.from('udc_vues').update({ vu_le: maintenant.toISOString() }).eq('id', vueExistante.id);
  } else {
    await supabaseAdmin.from('udc_vues').insert({ texte_id: texteId, identifiant, vu_le: maintenant.toISOString() });
  }

  await supabaseAdmin.rpc('increment_vues', { texte_id: texteId });

  return NextResponse.json({ comptee: true });
}
