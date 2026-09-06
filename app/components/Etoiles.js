'use client';

import { useState } from 'react';

export function EtoilesAffichage({ valeur, couleur, taille = '1.1rem' }) {
  const pourcentage = Math.max(0, Math.min(5, valeur)) / 5 * 100;
  return (
    <span style={{ position: 'relative', display: 'inline-block', fontSize: taille, lineHeight: 1 }}>
      <span style={{ color: '#DDD2BC', letterSpacing: 2 }}>★★★★★</span>
      <span style={{
        position: 'absolute', top: 0, left: 0, overflow: 'hidden', whiteSpace: 'nowrap',
        width: `${pourcentage}%`, color: couleur, letterSpacing: 2,
      }}>
        ★★★★★
      </span>
    </span>
  );
}

export function EtoilesVote({ texteId, couleur, maNoteInitiale = 0 }) {
  const [maNote, setMaNote] = useState(maNoteInitiale);
  const [survol, setSurvol] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  async function voter(n) {
    if (envoi) return;
    setEnvoi(true);
    setMaNote(n);
    try {
      const res = await fetch(`/api/textes/${texteId}/noter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: n }),
      });
      if (res.ok) {
        setConfirmation(true);
        setTimeout(() => setConfirmation(false), 2000);
      }
    } catch {
      // silencieux : le vote n'est pas critique
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div onMouseLeave={() => setSurvol(0)} style={{ display: 'flex' }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const rempli = (survol || maNote) >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => voter(n)}
              onMouseEnter={() => setSurvol(n)}
              disabled={envoi}
              aria-label={`Noter ${n} étoile${n > 1 ? 's' : ''}`}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                fontSize: '1.3rem', color: rempli ? couleur : '#DDD2BC', lineHeight: 1,
              }}
            >
              ★
            </button>
          );
        })}
      </div>
      {confirmation && (
        <span style={{ fontSize: '0.78rem', color: couleur, fontWeight: 600 }}>Merci !</span>
      )}
    </div>
  );
}
