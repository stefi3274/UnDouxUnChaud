'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'tout', label: 'Tout', color: null },
  { value: 'un_doux', label: 'Un Doux', color: '#E85D8A' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#3F8F5C' },
  { value: 'piment', label: 'Piment', color: '#E08A1D' },
  { value: 'piquant', label: 'Piquant', color: '#D4321F' },
  { value: 'poemes', label: 'Poèmes et Lettres', color: '#9B5FC0' },
];
const COULEURS = Object.fromEntries(CATEGORIES.filter((c) => c.color).map((c) => [c.value, c.color]));
const LABELS = Object.fromEntries(CATEGORIES.filter((c) => c.color).map((c) => [c.value, c.label]));

function formatDuree(secondes) {
  if (!secondes) return null;
  const m = Math.floor(secondes / 60);
  const s = Math.round(secondes % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioList({ audios, connecte }) {
  const [filtre, setFiltre] = useState('tout');
  const visibles = filtre === 'tout' ? audios : audios.filter((a) => a.categorie === filtre);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => {
            const actif = filtre === c.value;
            const couleur = c.color || '#2B2620';
            return (
              <button
                key={c.value}
                onClick={() => setFiltre(c.value)}
                style={{
                  padding: '8px 16px', borderRadius: 100, fontSize: '0.84rem', fontWeight: 700,
                  border: `1.5px solid ${couleur}`, background: actif ? couleur : '#fff',
                  color: actif ? '#fff' : couleur, cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {connecte && (
          <Link href="/audio/publier" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            🎙️ Proposer un audio
          </Link>
        )}
      </div>

      {visibles.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px', background: '#F8F3E8',
          border: '1px dashed #DDD2BC', borderRadius: 16, color: '#6B6255',
        }}>
          Aucun audio pour l'instant dans cette catégorie.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visibles.map((a) => (
          <div key={a.id} className={`card card-${a.categorie}`} style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <span className={`badge ${a.categorie}`}>{LABELS[a.categorie]}</span>
                <h3 style={{ marginTop: 10 }}>{a.titre}</h3>
              </div>
              {formatDuree(a.duree_secondes) && (
                <span style={{ fontSize: '0.8rem', color: '#6B6255' }}>{formatDuree(a.duree_secondes)}</span>
              )}
            </div>
            {a.description && <p className="card-excerpt">{a.description}</p>}
            {a.url && (
              <audio controls preload="none" src={a.url} style={{ width: '100%', marginTop: 12 }} />
            )}
            <div className="card-meta" style={{ marginTop: 10 }}>
              <span className="author">@{a.udc_users?.pseudo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
