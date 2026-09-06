'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CoupDeCoeurToggle({ texteId, actif }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function basculer() {
    setEnCours(true);
    await fetch('/api/admin/textes/coup-de-coeur', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte_id: texteId, coup_de_coeur: !actif }),
    });
    setEnCours(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={basculer}
      disabled={enCours}
      style={{
        border: `1px solid ${actif ? '#E08A1D' : '#DDD2BC'}`,
        background: actif ? '#E08A1D' : '#fff',
        color: actif ? '#fff' : '#6B6255',
        borderRadius: 100, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
      }}
    >
      {actif ? '🌟 Coup de cœur' : '☆ Mettre en coup de cœur'}
    </button>
  );
}
