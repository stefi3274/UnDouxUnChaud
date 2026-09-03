'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/app/components/PasswordInput';

export default function ConnexionPage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo, motdepasse }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error || 'Une erreur est survenue.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setErreur("Impossible de contacter le serveur. Vérifie ta connexion et réessaie.");
    } finally {
      setChargement(false);
    }
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
        <Link href="/" aria-label="Retour à l'accueil" style={{
          fontSize: '1.2rem', textDecoration: 'none', color: '#2B2620',
          border: '1px solid #DDD2BC', borderRadius: '50%', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>⬅️</Link>
        <div>
          <div className="site-logo">Un<span>Doux</span>UnChaud</div>
          <div className="site-sub">Magazine Érotique</div>
        </div>
      </header>

      <main style={{ maxWidth: 420, margin: '5vh auto 0', padding: '0 6vw' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif' }}>Connexion</h1>

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginTop: 16 }}>
          {erreur}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
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
          <label style={labelStyle}>Mot de passe</label>
          <PasswordInput
            value={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={chargement} className="btn-primary" style={{ width: '100%' }}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <Link href="/mot-de-passe-oublie" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: '#0A5F63' }}>
        Mot de passe oublié ?
      </Link>
    </main>
    </>
  );
}
