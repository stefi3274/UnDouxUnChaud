import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

// Appelé régulièrement par le client pendant qu'un utilisateur connecté
// a l'app ouverte, pour mettre à jour son horodatage "dernier_actif".
// Jamais bloquant : une erreur ici ne doit jamais casser autre chose.
export async function POST() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    await supabaseAdmin
      .from('udc_users')
      .update({ dernier_actif: new Date().toISOString() })
      .eq('id', user.id);
  } catch {
    // silencieux, la présence ne doit jamais faire échouer la requête
  }

  return NextResponse.json({ ok: true });
}
