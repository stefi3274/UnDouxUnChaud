'use client';

import { useState } from 'react';

export default function SignalementsList({ initial }) {
  const [signalements, setSignalements] = useState(initial);

  async function basculer(s) {
    await fetch(`/api/admin/signalements/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traite: !s.traite }),
    });
    setSignalements((prev) => prev.map((x) => (x.id === s.id ? { ...x, traite: !x.traite } : x)));
  }

  if (signalements.length === 0) {
    return <p style={{ color: '#6B6255', marginTop: 20 }}>Aucun signalement pour l'instant.</p>;
  }

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {signalements.map((s) => (
        <div key={s.id} style={{
          background: s.traite ? '#F8F3E8' : '#fff', border: '1px solid #DDD2BC', borderRadius: 14,
          padding: '16px 18px', opacity: s.traite ? 0.65 : 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700 }}>
                @{s.reporter?.pseudo} → @{s.reported?.pseudo}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 2 }}>
                {new Date(s.created_at).toLocaleString('fr-FR')}
              </div>
              {s.raison && (
                <p style={{ marginTop: 8, fontSize: '0.9rem' }}>{s.raison}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => basculer(s)}
              className="btn-outline"
              style={{ padding: '7px 14px', fontSize: '0.8rem', flexShrink: 0 }}
            >
              {s.traite ? '↺ Rouvrir' : '✓ Marquer traité'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
