// Envoie un e-mail via l'API Resend (https://resend.com).
// Nécessite la variable d'environnement RESEND_API_KEY.
// RESEND_FROM_EMAIL est optionnelle : par défaut on utilise l'adresse
// de test fournie par Resend, utilisable immédiatement sans domaine
// vérifié (livraison correcte, mais l'expéditeur affiché est générique).
export async function envoyerEmail({ to, subject, html }) {
  const from = process.env.RESEND_FROM_EMAIL || 'UnDouxUnChaud <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Échec envoi e-mail : ${detail}`);
  }
}

// Empêche qu'un pseudo contenant des caractères HTML (<, >, &...)
// ne casse ou n'injecte du contenu dans l'e-mail envoyé.
export function echapperHtml(texte) {
  return String(texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
