'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Rafraîchit les données de la page (nouveaux textes, likes, commentaires)
// sans recharger : toutes les 2 min, seulement si l'onglet est visible, et
// dès que l'on revient sur l'onglet. Ne touche pas à ce que la personne
// est en train de taper.
export default function AutoRafraichir({ secondes = 120 }) {
  const router = useRouter();

  useEffect(() => {
    let dernier = Date.now();
    const rafraichir = () => {
      if (document.visibilityState !== 'visible') return;
      dernier = Date.now();
      router.refresh();
    };
    const minuteur = setInterval(rafraichir, secondes * 1000);
    const auRetour = () => {
      if (document.visibilityState === 'visible' && Date.now() - dernier > 15000) rafraichir();
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      clearInterval(minuteur);
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, [router, secondes]);

  return null;
}
