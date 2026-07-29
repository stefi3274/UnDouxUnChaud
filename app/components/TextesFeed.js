'use client';

import { useState } from 'react';

const CATEGORIES = [
  { value: 'tout', label: 'Tout' },
  { value: 'un_doux', label: 'Un Doux' },
  { value: 'un_chaud', label: 'Un Chaud' },
  { value: 'piment', label: 'Piment' },
  { value: 'piquant', label: 'Piquant' },
  { value: 'poemes', label: 'Poèmes' },
];

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
  poemes: 'Poèmes',
};

function extrait(contenu) {
  const clean = contenu.trim().replace(/\s+/g, ' ');
  return clean.length > 160 ? clean.slice(0, 160) + '…' : clean;
}

export default function TextesFeed({ textes, hasAccount }) {
  const [filtre, setFiltre] = useState('tout');

  const visibles = filtre === 'tout' ? textes : textes.filter((t) => t.categorie === filtre);

  return (
    <>
      <div className="filters">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`chip ${filtre === c.value ? 'active' : ''}`}
            onClick={() => setFiltre(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visibles.length === 0 && (
        <div className="feed-empty">
          {textes.length === 0 ? (
            <>
              Aucun texte publié pour le moment. Sois la première plume à écrire ici —{' '}
              <a href={hasAccount ? '/ecrire' : '/inscription'}>
                {hasAccount ? 'écrire un texte' : "créer un compte pour écrire"}
              </a>.
            </>
          ) : (
            <>Aucun texte dans cette catégorie pour l'instant. Reviens bientôt, ou tente-toi à en écrire un.</>
          )}
        </div>
      )}

      <div className="feed">
        {visibles.map((texte) => (
          <a key={texte.id} href={`/textes/${texte.id}`} className="card">
            <span className={`badge ${texte.categorie}`}>
              {LABELS_CATEGORIE[texte.categorie]}
            </span>
            <h3 style={{ marginTop: 10 }}>{texte.titre}</h3>
            <p className="card-excerpt">{extrait(texte.contenu)}</p>
            <div className="card-meta">
              <span className="author">@{texte.udc_users?.pseudo}</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
