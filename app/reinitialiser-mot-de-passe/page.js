'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordInput from '@/app/components/PasswordInput';

function FormulaireReinitialisation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [motdepasse, setMotdepasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (motdepasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setChargement(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, motdepasse }),
    });
    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.error || 'Une erreur est survenue.');
      return;
    }

    router.push('/connexion');
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #DDD2BC',
    borderRadius: 10, fontSize: '0.9rem', background: '#fff', marginTop: 6,
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: '#6B6255',
  };

  if (!token) {
    return (
      <main style={{ maxWidth: 420, margin: '10vh auto 0', padding: '0 6vw', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Lien invalide</h1>
        <p style={{ color: '#6B6255', marginTop: 8 }}>
          Ce lien de réinitialisation est incomplet. Refais une demande depuis la page de connexion.
        </p>
        <Link href="/mot-de-passe-oublie" className="btn-primary" style={{ display: 'inline-block', marginTop: 20 }}>
          Refaire une demande
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: '10vh auto 0', padding: '0 6vw' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif' }}>Nouveau mot de passe</h1>

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginTop: 16 }}>
          {erreur}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nouveau mot de passe (8 caractères minimum)</label>
          <PasswordInput
            value={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Confirme le mot de passe</label>
          <PasswordInput
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={chargement} className="btn-primary" style={{ width: '100%' }}>
          {chargement ? 'Enregistrement...' : 'Changer le mot de passe'}
        </button>
      </form>
    </main>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={null}>
      <FormulaireReinitialisation />
    </Suspense>
  );
}
