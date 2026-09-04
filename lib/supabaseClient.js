import { createClient } from '@supabase/supabase-js';

let client = null;

// Instance unique du client Supabase côté navigateur, avec la clé
// publique (anon). Utilisée uniquement pour l'envoi direct de
// fichiers volumineux vers le stockage (via URL signée), qui doit
// contourner nos routes API pour ne pas buter sur la limite de
// taille des fonctions serverless Vercel.
export function getSupabaseNavigateur() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
