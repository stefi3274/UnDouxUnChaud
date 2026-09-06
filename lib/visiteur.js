import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getSessionUser } from './auth';

// Retourne un identifiant stable pour la personne courante :
// "user:<id>" si connectée, sinon "visiteur:<uuid>" stocké dans un
// cookie créé au besoin. Permet de limiter vues et votes par
// personne sans exiger de compte.
export function obtenirIdentifiant() {
  const user = getSessionUser();
  if (user) return `user:${user.id}`;

  const store = cookies();
  let vid = store.get('udc_vid')?.value;
  if (!vid) {
    vid = crypto.randomUUID();
    store.set('udc_vid', vid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }
  return `visiteur:${vid}`;
}

// Variante lecture seule, utilisable dans les Server Components (pages) :
// Next.js interdit d'écrire un cookie hors Route Handler/Server Action,
// donc ici on ne fait que LIRE le cookie visiteur s'il existe déjà,
// sans jamais tenter d'en créer un.
export function lireIdentifiant() {
  const user = getSessionUser();
  if (user) return `user:${user.id}`;
  const vid = cookies().get('udc_vid')?.value;
  return vid ? `visiteur:${vid}` : null;
}
