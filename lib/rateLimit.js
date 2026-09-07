import { supabaseAdmin } from './supabase';

// Vérifie et enregistre une tentative pour une clé donnée (ex :
// "login:1.2.3.4:pseudo"). Retourne { autorise: false } si le nombre
// de tentatives dans la fenêtre de temps est dépassé, sans compter
// cette nouvelle tentative. Sinon, l'enregistre et autorise.
export async function verifierLimite(cle, maxTentatives, fenetreMinutes) {
  try {
    const seuil = new Date(Date.now() - fenetreMinutes * 60 * 1000).toISOString();

    const { count, error } = await supabaseAdmin
      .from('udc_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('cle', cle)
      .gt('tentative_le', seuil);

    if (error) {
      // Table absente ou erreur réseau : on n'empêche jamais
      // l'action normale du site à cause d'un souci sur le limiteur.
      return { autorise: true };
    }
    if ((count || 0) >= maxTentatives) {
      return { autorise: false };
    }

    await supabaseAdmin.from('udc_rate_limits').insert({ cle });
    return { autorise: true };
  } catch {
    return { autorise: true };
  }
}

export function obtenirIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue';
}
