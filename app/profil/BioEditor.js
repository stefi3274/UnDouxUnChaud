'use client';

import { useState } from 'react';

export default function BioEditor({ bioInitiale }) {
  const [bio, setBio] = useState(bioInitiale);
  const [edition, setEdition] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  async function enregistrer() {
    setEnregistrement(true);
    try {
      await fetch('/api/profil/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });
      setEdition(false);
    } catch {
      // silencieux
    } finally {
      setEnregistrement(false);
    }
  }

  if (!edition) {
    return (
      <div style={{ marginTop: 16 }}>
        {bio ? (
          <p style={{ color: '#2B2620', fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>{bio}</p>
        ) : (
          <p style={{ color: '#6B6255', fontSize: '0.88rem' }}>Aucune bio pour l'instant.</p>
        )}
        <button
          type="button"
          onClick={() => setEdition(true)}
          style={{ background: 'none', border: 'none', color: '#0A5F63', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: 0, marginTop: 4 }}
        >
          ✏️ {bio ? 'Modifier ma bio' : 'Ajouter une bio'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={500}
        placeholder="Quelques mots sur toi, visibles sur ton profil public..."
        style={{
          width: '100%', minHeight: 90, padding: '10px 12px', border: '1px solid #DDD2BC',
          borderRadius: 10, fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="button" onClick={enregistrer} disabled={enregistrement} className="btn-primary" style={{ border: 'none', padding: '8px 18px', fontSize: '0.82rem' }}>
          {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button type="button" onClick={() => { setEdition(false); setBio(bioInitiale); }} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
          Annuler
        </button>
      </div>
    </div>
  );
}
