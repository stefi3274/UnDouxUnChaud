import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  const { token, motdepasse: motdepasseBrut } = await request.json();
  const motdepasse = motdepasseBrut?.trim();

  if (!token || !motdepasse) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  if (motdepasse.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: utilisateur } = await supabaseAdmin
    .from('udc_users')
    .select('id, reset_token_expires')
    .eq('reset_token_hash', tokenHash)
    .maybeSingle();

  if (!utilisateur || !utilisateur.reset_token_expires || new Date(utilisateur.reset_token_expires) < new Date()) {
    return NextResponse.json({ error: 'Lien invalide ou expiré. Refais une demande.' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(motdepasse, 10);

  const { data: misAJour, error: erreurMaj } = await supabaseAdmin
    .from('udc_users')
    .update({ password_hash, reset_token_hash: null, reset_token_expires: null })
    .eq('id', utilisateur.id)
    .select('id')
    .maybeSingle();

  if (erreurMaj || !misAJour) {
    console.error('Erreur mise à jour mot de passe:', erreurMaj?.message);
    return NextResponse.json({ error: "La mise à jour a échoué côté serveur. Réessaie ou contacte le support." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
