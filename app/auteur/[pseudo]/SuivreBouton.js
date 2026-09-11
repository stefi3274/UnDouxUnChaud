'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuivreBouton({ auteurId, initialementSuivi }) {
  const router = useRouter();
  const [suivi, setSuivi] = useState(initialementSuivi);
  const [chargement, setChargement] = useState(false);

  async function basculer() {
    setChargement(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auteur_id: auteurId }),
      });
      const data = await res.json();
      if (res.ok) setSuivi(data.suivi);
      router.refresh();
    } catch {
      // silencieux
    } finally {
      setChargement(false);
    }
  }

  return (
    <button
      type="button"
      onClick={basculer}
      disabled={chargement}
      style={{
        padding: '9px 20px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
        border: `1px solid ${suivi ? '#DDD2BC' : '#0A5F63'}`,
        background: suivi ? '#fff' : '#0A5F63',
        color: suivi ? '#2B2620' : '#fff',
      }}
    >
      {suivi ? '✓ Suivi·e' : '+ Suivre'}
    </button>
  );
}
