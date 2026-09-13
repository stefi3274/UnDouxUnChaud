'use client';

import { useState } from 'react';

export default function BoutonsPartage({ url, titre, style }) {
  const [copie, setCopie] = useState(false);

  const texteEncode = encodeURIComponent(`${titre} — à lire sur UnDouxUnChaud`);
  const urlEncodee = encodeURIComponent(url);

  const liens = [
    { nom: 'WhatsApp', icone: '💬', href: `https://wa.me/?text=${texteEncode}%20${urlEncodee}`, couleur: '#25D366' },
    { nom: 'Facebook', icone: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${urlEncodee}`, couleur: '#1877F2' },
    { nom: 'X', icone: '✕', href: `https://twitter.com/intent/tweet?text=${texteEncode}&url=${urlEncodee}`, couleur: '#000000' },
  ];

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // silencieux
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', ...style }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6B6255', marginRight: 2 }}>Partager :</span>
      {liens.map((l) => (
        <a
          key={l.nom}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${l.nom}`}
          style={{
            width: 38, height: 38, borderRadius: '50%', background: l.couleur, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          {l.icone}
        </a>
      ))}
      <button
        type="button"
        onClick={copierLien}
        aria-label="Copier le lien"
        style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff', border: '1px solid #DDD2BC',
          color: '#2B2620', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', cursor: 'pointer', flexShrink: 0,
        }}
      >
        {copie ? '✓' : '🔗'}
      </button>
    </div>
  );
}
