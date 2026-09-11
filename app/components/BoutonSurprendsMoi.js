'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BoutonSurprendsMoi({ className, style }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  async function surprendsMoi() {
    setChargement(true);
    try {
      const res = await fetch('/api/textes/aleatoire');
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/textes/${data.id}`);
        return;
      }
    } catch {
      // silencieux
    }
    setChargement(false);
  }

  return (
    <button type="button" onClick={surprendsMoi} disabled={chargement} className={className} style={style}>
      {chargement ? '...' : '🎲 Surprends-moi'}
    </button>
  );
}
