import { revalidateTag } from 'next/cache';

// Les lectures publiques de Supabase sont gardées en cache (économie de quota).
// Chaque action qui modifie le contenu visible (publication, like, commentaire,
// note, suppression...) appelle cette fonction pour que le site affiche aussitôt
// la nouvelle version.
export function rafraichirContenu() {
  try {
    revalidateTag('contenu');
  } catch {
    // ne doit jamais faire échouer l'action
  }
}
