'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, motdepasse }),
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

  return (
    <main style={{ maxWidth: 420, margin: '10vh auto', padding: '0 6vw' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif' }}>Connexion</h1>

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginTop: 16 }}>
          {erreur}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label>Pseudo</label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Mot de passe</label>
          <input
            type="password"
            value={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </div>
        <button type="submit" disabled={chargement} style={{ padding: '12px 24px' }}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}
