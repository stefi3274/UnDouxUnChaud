'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LABELS = { un_doux: 'Un Doux', un_chaud: 'Un Chaud', piment: 'Piment', piquant: 'Piquant', poemes: 'Poèmes et Lettres' };
const COULEURS = { un_doux: '#E85D8A', un_chaud: '#3F8F5C', piment: '#E08A1D', piquant: '#D4321F', poemes: '#9B5FC0' };

export default function AudioQueue({ audios }) {
  const router = useRouter();
  const [refuseOpenId, setRefuseOpenId] = useState(null);
  const [raison, setRaison] = useState('');
  const [chargement, setChargement] = useState(null);

  async function accepter(id) {
    setChargement(id);
    await fetch('/api/admin/audio/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_id: id }),
    });
    setChargement(null);
    router.refresh();
  }

  async function refuser(id) {
    if (!raison.trim()) return;
    setChargement(id);
    await fetch('/api/admin/audio/refuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_id: id, raison }),
    });
    setChargement(null);
    setRefuseOpenId(null);
    setRaison('');
    router.refresh();
  }

  if (audios.length === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center', background: '#F8F3E8', border: '1px dashed #DDD2BC', borderRadius: 16, color: '#6B6255' }}>
        Aucun audio en attente.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {audios.map((a) => (
        <div key={a.id} style={{
          background: '#fff', border: '1px solid #DDD2BC', borderLeft: `4px solid ${COULEURS[a.categorie]}`,
          borderRadius: 16, padding: 20,
        }}>
          <span style={{ background: COULEURS[a.categorie], color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
            {LABELS[a.categorie]}
          </span>
          <h3 style={{ fontFamily: 'Fraunces, serif', marginTop: 8 }}>{a.titre}</h3>
          {a.description && <p style={{ color: '#6B6255', fontSize: '0.88rem', marginTop: 4 }}>{a.description}</p>}
          {a.url && <audio controls preload="none" src={a.url} style={{ width: '100%', marginTop: 12 }} />}
          <p style={{ fontSize: '0.8rem', color: '#6B6255', marginTop: 10 }}>
            @{a.udc_users?.pseudo} · {new Date(a.date_soumission).toLocaleDateString('fr-FR')}
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              onClick={() => accepter(a.id)}
              disabled={chargement === a.id}
              style={{ background: '#0E7C81', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ✓ Accepter
            </button>
            <button
              onClick={() => { setRefuseOpenId(refuseOpenId === a.id ? null : a.id); setRaison(''); }}
              style={{ background: 'none', border: '1px solid #B23A2E', color: '#B23A2E', borderRadius: 100, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ✕ Refuser
            </button>
          </div>

          {refuseOpenId === a.id && (
            <div style={{ marginTop: 12 }}>
              <textarea
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
                placeholder="Raison du refus..."
                style={{ width: '100%', minHeight: 60, padding: 10, border: '1px solid #DDD2BC', borderRadius: 10, boxSizing: 'border-box' }}
              />
              <button
                onClick={() => refuser(a.id)}
                disabled={chargement === a.id}
                style={{ marginTop: 8, background: '#B23A2E', color: '#fff', border: 'none', borderRadius: 100, padding: '7px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Confirmer le refus
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
