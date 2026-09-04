'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LABELS = { un_doux: 'Un Doux', un_chaud: 'Un Chaud', piment: 'Piment', piquant: 'Piquant' };
const COULEURS = { un_doux: '#E85D8A', un_chaud: '#3F8F5C', piment: '#E08A1D', piquant: '#D4321F' };

export default function PhotosQueue({ photos }) {
  const router = useRouter();
  const [refuseOpenId, setRefuseOpenId] = useState(null);
  const [raison, setRaison] = useState('');
  const [chargement, setChargement] = useState(null);

  async function accepter(id) {
    setChargement(id);
    await fetch('/api/admin/photos/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: id }),
    });
    setChargement(null);
    router.refresh();
  }

  async function refuser(id) {
    if (!raison.trim()) return;
    setChargement(id);
    await fetch('/api/admin/photos/refuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: id, raison }),
    });
    setChargement(null);
    setRefuseOpenId(null);
    setRaison('');
    router.refresh();
  }

  if (photos.length === 0) {
    return (
      <div style={{ marginTop: 4, padding: '32px 24px', textAlign: 'center', background: '#F8F3E8', border: '1px dashed #DDD2BC', borderRadius: 16, color: '#6B6255' }}>
        Aucune photo en attente.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {photos.map((p) => (
        <div key={p.id} style={{
          background: '#fff', border: '1px solid #DDD2BC', borderLeft: `4px solid ${COULEURS[p.categorie]}`,
          borderRadius: 16, padding: 20, display: 'flex', gap: 16, flexWrap: 'wrap',
        }}>
          {p.url && (
            <img src={p.url} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <span style={{ background: COULEURS[p.categorie], color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
              {LABELS[p.categorie]}
            </span>
            {p.titre && <h3 style={{ fontFamily: 'Fraunces, serif', marginTop: 8 }}>{p.titre}</h3>}
            {p.description && <p style={{ color: '#6B6255', fontSize: '0.88rem', marginTop: 4 }}>{p.description}</p>}
            <p style={{ fontSize: '0.8rem', color: '#6B6255', marginTop: 8 }}>
              @{p.udc_users?.pseudo} · {new Date(p.date_soumission).toLocaleDateString('fr-FR')}
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => accepter(p.id)}
                disabled={chargement === p.id}
                style={{ background: '#0E7C81', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ✓ Accepter
              </button>
              <button
                onClick={() => { setRefuseOpenId(refuseOpenId === p.id ? null : p.id); setRaison(''); }}
                style={{ background: 'none', border: '1px solid #B23A2E', color: '#B23A2E', borderRadius: 100, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ✕ Refuser
              </button>
            </div>

            {refuseOpenId === p.id && (
              <div style={{ marginTop: 12 }}>
                <textarea
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  placeholder="Raison du refus..."
                  style={{ width: '100%', minHeight: 60, padding: 10, border: '1px solid #DDD2BC', borderRadius: 10, boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => refuser(p.id)}
                  disabled={chargement === p.id}
                  style={{ marginTop: 8, background: '#B23A2E', color: '#fff', border: 'none', borderRadius: 100, padding: '7px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
                >
                  Confirmer le refus
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
