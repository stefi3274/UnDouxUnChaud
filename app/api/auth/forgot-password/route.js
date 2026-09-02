import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { envoyerEmail } from '@/lib/email';

const MESSAGE_GENERIQUE = "Si un compte existe avec cet e-mail, un lien de réinitialisation vient d'être envoyé.";

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'E-mail requis.' }, { status: 400 });
  }

  const { data: utilisateur } = await supabaseAdmin
    .from('udc_users')
    .select('id, pseudo, email')
    .eq('email', email)
    .maybeSingle();

  // Toujours la même réponse, que le compte existe ou non : on ne
  // révèle jamais si un e-mail est enregistré sur le site.
  if (!utilisateur) {
    return NextResponse.json({ message: MESSAGE_GENERIQUE });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await supabaseAdmin
    .from('udc_users')
    .update({ reset_token_hash: tokenHash, reset_token_expires: expiration.toISOString() })
    .eq('id', utilisateur.id);

  const origin = new URL(request.url).origin;
  const lien = `${origin}/reinitialiser-mot-de-passe?token=${token}`;

  try {
    await envoyerEmail({
      to: utilisateur.email,
      subject: 'Réinitialise ton mot de passe — UnDouxUnChaud',
      html: `
        <p>Bonjour @${utilisateur.pseudo},</p>
        <p>Tu as demandé à réinitialiser ton mot de passe sur UnDouxUnChaud.</p>
        <p><a href="${lien}">Clique ici pour choisir un nouveau mot de passe</a></p>
        <p>Ce lien expire dans 1 heure. Si tu n'es pas à l'origine de cette demande, ignore simplement cet e-mail.</p>
      `,
    });
  } catch (err) {
    console.error('Erreur envoi e-mail reset:', err.message);
    return NextResponse.json({ error: "L'envoi de l'e-mail a échoué. Réessaie plus tard." }, { status: 500 });
  }

  return NextResponse.json({ message: MESSAGE_GENERIQUE });
}
