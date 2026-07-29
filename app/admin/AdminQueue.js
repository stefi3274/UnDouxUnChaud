'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
};

export default function AdminQueue({ textes }) {
  const router = useRouter();
  const [refuseOpenId, setRefuseOpenId] = useState(null);
  const [raison, setRaison] = useState('');
  const [chargement, setChargement] = useState(null);

  async function accepter(id) {
    setChargement(id);
    await fetch('/api/admin/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte_id: id }),
    });
    setChargement(null);
    router.refresh();
  }

  async function refuser(id) {
    if (!raison.trim()) return;
    setChargement(id);
    await fetch('/api/admin/refuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte_id: id, raison }),
    });
    setChargement(null);
    setRefuseOpenId(null);
    setRaison('');
    router.refresh();
  }

  if (textes.length === 0) {
    return <p style={{ color: '#6B6255', marginTop: 20 }}>Aucun texte en attente.</p>;
  }

  return (
    <div style={{ marginTop: 20 }}>
      {textes.map((t) => (
        <div key={t.id} style={{
          background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 16,
          padding: 22, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                {LABELS_CATEGORIE[t.categorie]}
              </span>
              <h3 style={{ fontFamily: 'Fraunces, serif', marginTop: 6 }}>{t.titre}</h3>
              <div style={{ fontSize: '0.82rem', color: '#6B6255', marginTop: 4 }}>
                @{t.udc_users?.pseudo} · {new Date(t.date_soumission).toLocaleDateString('fr-FR')}
              </div>
              {(t.tags?.length > 0 || t.orientation_hh || t.orientation_ff) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {t.orientation_hh && <span style={chipStyle}>HH</span>}
                  {t.orientation_ff && <span style={chipStyle}>FF</span>}
                  {t.tags?.map((tag) => <span key={tag} style={chipStyle}>{tag}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => accepter(t.id)}
                disabled={chargement === t.id}
                style={{ background: '#0E7C81', color: '#fff', border: 'none', borderRadius: 100, padding: '9px 18px', fontWeight: 600, cursor: 'pointer' }}
              >
                Accepter
              </button>
              <button
                onClick={() => setRefuseOpenId(refuseOpenId === t.id ? null : t.id)}
                style={{ background: 'none', border: '1px solid #B23A2E', color: '#B23A2E', borderRadius: 100, padding: '9px 18px', fontWeight: 600, cursor: 'pointer' }}
              >
                Refuser
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#6B6255', marginTop: 14, lineHeight: 1.6 }}>
            {t.contenu.slice(0, 220)}...
          </p>

          {refuseOpenId === t.id && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #DDD2BC' }}>
              <textarea
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
                placeholder="Raison du refus..."
                style={{ width: '100%', minHeight: 70, padding: 10, border: '1px solid #DDD2BC', borderRadius: 10 }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => refuser(t.id)}
                  disabled={chargement === t.id}
                  style={{ background: '#B23A2E', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirmer le refus
                </button>
                <button
                  onClick={() => { setRefuseOpenId(null); setRaison(''); }}
                  style={{ background: 'none', border: '1px solid #DDD2BC', borderRadius: 100, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const chipStyle = {
  background: '#fff', border: '1px solid #DDD2BC', borderRadius: 100,
  padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#6B6255',
};
