'use client';

import { useEffect, useState } from 'react';

export default function AgeGate() {
  const [visible, setVisible] = useState(true);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    let confirme = null;
    try {
      confirme = localStorage.getItem('udc_age_confirme');
    } catch {
      // stockage indisponible (navigation privée stricte, etc.) : on
      // redemande simplement à chaque visite, sans planter le site.
    }
    if (confirme === '1') setVisible(false);
    setPret(true);
  }, []);

  function confirmer() {
    try { localStorage.setItem('udc_age_confirme', '1'); } catch {}
    setVisible(false);
  }

  function refuser() {
    window.location.href = 'https://www.google.com';
  }

  // Rien à l'écran tant qu'on n'a pas vérifié le stockage : évite un
  // flash de contenu réservé aux adultes avant que le contrôle passe.
  if (!pret || !visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: '#181410',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6vw',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw',
        minWidth: 500, minHeight: 500,
        background: 'linear-gradient(120deg, #E85D8A, #3F8F5C, #E08A1D, #D4321F, #9B5FC0)',
        opacity: 0.25, filter: 'blur(90px)', borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', background: '#F8F3E8', borderRadius: 24, padding: '44px 32px',
        maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
      }}>
        <img
          src="/logo.jpg"
          alt="UnDouxUnChaud"
          style={{ width: 140, height: 140, borderRadius: 18, margin: '0 auto', display: 'block', objectFit: 'cover' }}
        />

        <p style={{ marginTop: 22, color: '#2B2620', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Ce site rassemble des textes à caractère érotique, réservés à un public adulte.
        </p>
        <p style={{ marginTop: 12, fontWeight: 700, fontSize: '1.15rem', fontFamily: 'Fraunces, serif' }}>
          As-tu 18 ans ou plus ?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
          <button
            type="button"
            onClick={confirmer}
            style={{
              width: '100%', border: 'none', borderRadius: 100, padding: '14px 20px',
              background: '#0A5F63', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            }}
          >
            Oui, j'ai 18 ans ou plus — Entrer
          </button>
          <button
            type="button"
            onClick={refuser}
            style={{
              width: '100%', border: '1px solid #DDD2BC', borderRadius: 100, padding: '13px 20px',
              background: 'transparent', color: '#6B6255', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Non — Sortir
          </button>
        </div>
      </div>
    </div>
  );
}
