'use client';

import { useState } from 'react';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setMessage('');
    setChargement(true);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.error || 'Une erreur est survenue.');
      return;
    }
    setMessage(data.message);
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #DDD2BC',
    borderRadius: 10, fontSize: '0.9rem', background: '#fff', marginTop: 6,
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: '#6B6255',
  };

  return (
    <>
      <header style={{ padding: '20px 6vw', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #DDD2BC' }}>
        <a href="/connexion" aria-label="Retour à la connexion" style={{
          fontSize: '1.2rem', textDecoration: 'none', color: '#2B2620',
          border: '1px solid #DDD2BC', borderRadius: '50%', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>⬅️</a>
        <div>
          <div className="site-logo">Un<span>Doux</span>UnChaud</div>
          <div className="site-sub">Magazine Érotique</div>
        </div>
      </header>

      <main style={{ maxWidth: 420, margin: '5vh auto 0', padding: '0 6vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Mot de passe oublié</h1>
        <p style={{ color: '#6B6255', marginTop: 8 }}>
          Indique l'e-mail utilisé à l'inscription, on t'envoie un lien pour en choisir un nouveau.
        </p>

        {erreur && (
          <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginTop: 16 }}>
            {erreur}
          </p>
        )}
        {message && (
          <p style={{ background: '#E9F3EA', color: '#2E5A38', padding: '10px 14px', borderRadius: 10, marginTop: 16 }}>
            {message}
          </p>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={chargement} className="btn-primary" style={{ width: '100%' }}>
              {chargement ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
