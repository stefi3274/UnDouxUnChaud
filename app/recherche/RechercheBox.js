'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux', un_chaud: 'Un Chaud', piment: 'Piment', piquant: 'Piquant',
  poemes: 'Poèmes et Lettres', chat_fiction: 'Chat Fiction',
};

function extrait(contenu) {
  const clean = contenu.trim().replace(/\s+/g, ' ');
  return clean.length > 160 ? clean.slice(0, 160) + '…' : clean;
}

export default function RechercheBox() {
  const [q, setQ] = useState('');
  const [resultats, setResultats] = useState(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) { setResultats(null); return; }
    setChargement(true);
    const t = setTimeout(() => {
      fetch(`/api/recherche?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((d) => setResultats(d.textes || []))
        .catch(() => setResultats([]))
        .finally(() => setChargement(false));
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const inputStyle = {
    width: '100%', padding: '14px 16px', border: '1px solid #DDD2BC',
    borderRadius: 100, fontSize: '1rem', background: '#fff', boxSizing: 'border-box', marginTop: 16,
  };

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Titre, mot-clé, extrait..."
        style={inputStyle}
        autoFocus
      />

      {chargement && <p style={{ color: '#6B6255', marginTop: 20 }}>Recherche...</p>}

      {!chargement && resultats !== null && resultats.length === 0 && (
        <p style={{ color: '#6B6255', marginTop: 20 }}>Aucun résultat pour « {q} ».</p>
      )}

      {!chargement && resultats && resultats.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          {resultats.map((t) => (
            <Link key={t.id} href={`/textes/${t.id}`} className={`card card-${t.categorie}`}>
              <span className={`badge ${t.categorie}`}>{LABELS_CATEGORIE[t.categorie]}</span>
              <h3 style={{ marginTop: 10 }}>{t.titre}</h3>
              <p className="card-excerpt">{extrait(t.contenu)}</p>
              <div className="card-meta">
                <span className="author">@{t.udc_users?.pseudo}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
