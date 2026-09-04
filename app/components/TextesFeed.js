'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdCard from './AdCard';

const CATEGORIES = [
  { value: 'tout', label: 'Tout', color: null },
  { value: 'un_doux', label: 'Un Doux', color: '#E85D8A' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#3F8F5C' },
  { value: 'piment', label: 'Piment', color: '#E08A1D' },
  { value: 'piquant', label: 'Piquant', color: '#D4321F' },
  { value: 'poemes', label: 'Poèmes', color: '#9B5FC0' },
];

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
  poemes: 'Poèmes',
};

const INTERVALLE_PUB = 6;

function extrait(contenu) {
  const clean = contenu.trim().replace(/\s+/g, ' ');
  return clean.length > 160 ? clean.slice(0, 160) + '…' : clean;
}

export default function TextesFeed({ textes, hasAccount, ads = [] }) {
  const [filtre, setFiltre] = useState('tout');

  const visibles = filtre === 'tout' ? textes : textes.filter((t) => t.categorie === filtre);

  return (
    <>
      <div className="filters">
        {CATEGORIES.map((c) => {
          const actif = filtre === c.value;
          const couleur = c.color || '#2B2620';
          return (
            <button
              key={c.value}
              onClick={() => setFiltre(c.value)}
              style={{
                padding: '9px 18px', borderRadius: 100, fontSize: '0.86rem', fontWeight: 700,
                border: `1.5px solid ${couleur}`,
                background: actif ? couleur : '#fff',
                color: actif ? '#fff' : couleur,
                cursor: 'pointer', transition: 'transform .12s ease',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {visibles.length === 0 && (
        <div className="feed-empty">
          {textes.length === 0 ? (
            <>
              Aucun texte publié pour le moment. Sois la première plume à écrire ici —{' '}
              <Link href={hasAccount ? '/ecrire' : '/inscription'}>
                {hasAccount ? 'écrire un texte' : "créer un compte pour écrire"}
              </Link>.
            </>
          ) : (
            <>Aucun texte dans cette catégorie pour l'instant. Reviens bientôt, ou tente-toi à en écrire un.</>
          )}
        </div>
      )}

      <div className="feed">
        {visibles.map((texte, i) => (
          <div key={texte.id} style={{ display: 'contents' }}>
            {ads.length > 0 && i > 0 && i % INTERVALLE_PUB === 0 && (
              <AdCard ad={ads[(i / INTERVALLE_PUB - 1) % ads.length]} />
            )}
            <Link href={`/textes/${texte.id}`} className={`card card-${texte.categorie}`}>
              <span className={`badge ${texte.categorie}`}>
                {LABELS_CATEGORIE[texte.categorie]}
              </span>
              <h3 style={{ marginTop: 10 }}>{texte.titre}</h3>
              <p className="card-excerpt">{extrait(texte.contenu)}</p>
              <div className="card-meta">
                <span className="author">@{texte.udc_users?.pseudo}</span>
                <span style={{ display: 'flex', gap: 12 }}>
                  <span>👁️ {texte.vues || 0}</span>
                  <span>❤️ {texte.likeCount || 0}</span>
                  <span>💬 {texte.commentCount || 0}</span>
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
