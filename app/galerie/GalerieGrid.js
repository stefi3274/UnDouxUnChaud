'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'tout', label: 'Tout', color: null },
  { value: 'un_doux', label: 'Un Doux', color: '#E85D8A' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#3F8F5C' },
  { value: 'piment', label: 'Piment', color: '#E08A1D' },
  { value: 'piquant', label: 'Piquant', color: '#D4321F' },
];
const COULEURS = Object.fromEntries(CATEGORIES.filter((c) => c.color).map((c) => [c.value, c.color]));
const LABELS = Object.fromEntries(CATEGORIES.filter((c) => c.color).map((c) => [c.value, c.label]));

export default function GalerieGrid({ photos, connecte }) {
  const [filtre, setFiltre] = useState('tout');
  const [ouverte, setOuverte] = useState(null);

  const visibles = filtre === 'tout' ? photos : photos.filter((p) => p.categorie === filtre);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
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
          <Link href="/photos/publier" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            📷 Proposer une photo
          </Link>
        )}
      </div>

      {visibles.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px', background: '#F8F3E8',
          border: '1px dashed #DDD2BC', borderRadius: 16, color: '#6B6255',
        }}>
          Aucune photo pour l'instant dans cette catégorie.
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16,
      }}>
        {visibles.map((p) => (
          <button
            key={p.id}
            onClick={() => setOuverte(p)}
            style={{
              position: 'relative', border: 'none', padding: 0, cursor: 'pointer',
              borderRadius: 16, overflow: 'hidden', aspectRatio: '4 / 5', background: '#181410',
              borderLeft: `4px solid ${COULEURS[p.categorie]}`,
            }}
          >
            {p.url && (
              <img src={p.url} alt={p.titre || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{
              position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)',
            }} />
            {p.titre && (
              <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, color: '#fff', fontWeight: 700, fontSize: '0.9rem', textAlign: 'left' }}>
                {p.titre}
              </div>
            )}
          </button>
        ))}
      </div>

      {ouverte && (
        <div
          onClick={() => setOuverte(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.92)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5vw',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, width: '100%' }}>
            {ouverte.url && (
              <img src={ouverte.url} alt={ouverte.titre || ''} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 12, display: 'block', margin: '0 auto' }} />
            )}
            <div style={{ color: '#fff', marginTop: 16, textAlign: 'center' }}>
              <span style={{
                display: 'inline-block', background: COULEURS[ouverte.categorie], color: '#fff',
                fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 8,
              }}>
                {LABELS[ouverte.categorie]}
              </span>
              {ouverte.titre && <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.2rem' }}>{ouverte.titre}</h3>}
              {ouverte.description && <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 6, fontSize: '0.9rem' }}>{ouverte.description}</p>}
              {ouverte.source === 'communaute' && ouverte.udc_users?.pseudo && (
                <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8, fontSize: '0.8rem' }}>Proposée par @{ouverte.udc_users.pseudo}</p>
              )}
            </div>
            <button
              onClick={() => setOuverte(null)}
              style={{
                position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.12)', border: 'none',
                color: '#fff', width: 40, height: 40, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
