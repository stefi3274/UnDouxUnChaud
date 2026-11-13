import { createClient } from '@supabase/supabase-js';

// Next.js 14 garde les fetch en cache (Data Cache). On l'utilise a dessein :
// - lectures publiques : gardees en cache (etiquette "contenu", 10 min au plus)
//   et invalidees tout de suite par rafraichirContenu() (lib/cache.js) des
//   qu'un texte, like, commentaire, etc. est modifie. Cela economise le quota
//   Supabase tout en gardant le site a jour.
// - lectures admin : toujours fraiches (donnees privees ou en attente).
const fetchAvecCache = (url, options = {}) =>
  fetch(url, { ...options, next: { revalidate: 600, tags: ['contenu'] } });
const fetchSansCache = (url, options = {}) => fetch(url, { ...options, cache: 'no-store' });

// Client public : à utiliser côté navigateur ET côté serveur pour
// toute LECTURE (respecte les policies RLS de lecture publique).
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { global: { fetch: fetchAvecCache } }
);

// Client admin : SERVEUR UNIQUEMENT (routes API dans app/api/...).
// Utilise la clé service_role qui contourne RLS. Ne jamais importer
// ce fichier dans un composant "use client" ou l'exposer au navigateur.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false }, global: { fetch: fetchSansCache } }
);

// Lecture de contenu PUBLIC qui exige la cle service_role (ex. commentaires avec
// auteurs), mais gardee en cache comme les lectures publiques. SERVEUR UNIQUEMENT.
export const supabaseContenu = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false }, global: { fetch: fetchAvecCache } }
);
