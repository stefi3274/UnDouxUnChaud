'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MessageAuteurButton({ auteurId, connecte }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  async function demarrer() {
    if (!connecte) {
      router.push('/connexion');
      return;
    }
    setChargement(true);
    const res = await fetch('/api/messages/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinataire_id: auteurId }),
    });
    const data = await res.json();
    setChargement(false);
    if (!res.ok) {
      alert(data.error || 'Erreur.');
      return;
    }
    router.push(`/messages/${data.conversationId}`);
  }

  return (
    <button
      type="button"
      onClick={demarrer}
      disabled={chargement}
      style={{
        background: 'none', border: '1px solid #DDD2BC', borderRadius: 100,
        padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, color: '#0A5F63',
        cursor: 'pointer', marginLeft: 10,
      }}
    >
      💬 Message
    </button>
  );
}
