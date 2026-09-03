'use client';

import { useRef, useState } from 'react';

export default function AvatarUpload({ avatarUrl, pseudo }) {
  const [url, setUrl] = useState(avatarUrl);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErreur('');
    setChargement(true);

    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/profil/avatar', { method: 'POST', body: fd });
    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.error || "Erreur lors de l'envoi.");
      return;
    }
    setUrl(data.url);
  }

  async function supprimer() {
    setChargement(true);
    await fetch('/api/profil/avatar', { method: 'DELETE' });
    setUrl(null);
    setChargement(false);
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={chargement}
        style={{
          width: 84, height: 84, borderRadius: '50%', border: '2px solid #DDD2BC',
          background: url ? `url(${url}) center/cover no-repeat` : '#F8F3E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 700, color: '#0A5F63', cursor: 'pointer', padding: 0,
          overflow: 'hidden',
        }}
        aria-label="Changer la photo de profil"
      >
        {!url && (pseudo?.[0]?.toUpperCase() || '?')}
      </button>
      <span style={{
        position: 'absolute', bottom: -2, right: -2, background: '#2B2620', color: '#fff',
        borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.8rem', pointerEvents: 'none',
      }}>
        📷
      </span>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: '0.75rem' }}>
        {url && (
          <button type="button" onClick={supprimer} style={{ background: 'none', border: 'none', color: '#B23A2E', cursor: 'pointer', padding: 0 }}>
            Retirer
          </button>
        )}
      </div>
      {erreur && <p style={{ color: '#B23A2E', fontSize: '0.75rem', marginTop: 4, maxWidth: 150 }}>{erreur}</p>}
    </div>
  );
}
