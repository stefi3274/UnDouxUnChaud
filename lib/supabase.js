import { createClient } from '@supabase/supabase-js';

// Client public : à utiliser côté navigateur ET côté serveur pour
// toute LECTURE (respecte les policies RLS de lecture publique).
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Client admin : SERVEUR UNIQUEMENT (routes API dans app/api/...).
// Utilise la clé service_role qui contourne RLS. Ne jamais importer
// ce fichier dans un composant "use client" ou l'exposer au navigateur.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
