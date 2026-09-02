'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InscriptionPage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [email, setEmail] = useState('');
  const [majeur, setMajeur] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!majeur) {
      setErreur("Tu dois certifier avoir l'âge légal requis.");
      return;
    }

    setChargement(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, motdepasse, email }),
    });
    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.error || 'Une erreur est survenue.');
      return;
    }

    router.push('/');
    router.refresh();
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
        <a href="/" aria-label="Retour à l'accueil" style={{
          fontSize: '1.2rem', textDecoration: 'none', color: '#2B2620',
          border: '1px solid #DDD2BC', borderRadius: '50%', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>⬅️</a>
        <div>
          <div className="site-logo">Un<span>Doux</span>UnChaud</div>
          <div className="site-sub">Magazine littéraire</div>
        </div>
      </header>

    <main style={{ maxWidth: 420, margin: '5vh auto 0', padding: '0 6vw' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif' }}>Créer un compte</h1>

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginTop: 16 }}>
          {erreur}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <p style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 6 }}>
            Ton e-mail ne sera jamais public. Seul ton pseudo sera visible : c'est lui qui apparaît sur tes publications, commentaires, likes et partages.
          </p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Pseudo</label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Mot de passe (8 caractères minimum)</label>
          <input
            type="password"
            value={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </div>
        <div style={{
          marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start',
          background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 12, padding: '14px 16px',
        }}>
          <input
            type="checkbox"
            checked={majeur}
            onChange={(e) => setMajeur(e.target.checked)}
            style={{ marginTop: 3, flexShrink: 0 }}
          />
          <label style={{ fontSize: '0.88rem' }}>Je certifie avoir l'âge légal requis pour accéder à du contenu adulte.</label>
        </div>
        <button type="submit" disabled={chargement} className="btn-primary" style={{ width: '100%' }}>
          {chargement ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
    </main>
    </>
  );
}
