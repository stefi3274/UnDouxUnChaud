import { supabaseAdmin } from './supabase';

export async function creerNotification({ user_id, type, texte_id = null, acteur_id = null }) {
  if (acteur_id && acteur_id === user_id) return; // jamais de notif pour sa propre action
  await supabaseAdmin.from('udc_notifications').insert({ user_id, type, texte_id, acteur_id });
}
