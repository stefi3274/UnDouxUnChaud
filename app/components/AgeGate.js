'use client';

import { useEffect, useState } from 'react';

export default function AgeGate() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const confirme = localStorage.getItem('udc_age_confirme');
    if (confirme === '1') setVisible(false);
  }, []);

  function confirmer() {
    localStorage.setItem('udc_age_confirme', '1');
    setVisible(false);
  }

  function refuser() {
    window.location.href = 'https://www.google.com';
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: '#2B2620',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6vw',
    }}>
      <div style={{
        background: '#F8F3E8', borderRadius: 20, padding: '40px 32px', maxWidth: 400,
        width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', fontWeight: 600 }}>
          Un<em style={{ color: '#0E7C81', fontStyle: 'italic' }}>Doux</em>UnChaud
        </div>
        <p style={{ marginTop: 18, color: '#2B2620', lineHeight: 1.6 }}>
          Ce site rassemble des textes à caractère érotique, réservés à un public adulte.
        </p>
        <p style={{ marginTop: 10, fontWeight: 700, fontSize: '1.05rem' }}>
          As-tu 18 ans ou plus ?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          <button
            type="button"
            onClick={confirmer}
            className="btn-primary"
            style={{ border: 'none', width: '100%' }}
          >
            Oui, j'ai 18 ans ou plus
          </button>
          <button
            type="button"
            onClick={refuser}
            className="btn-outline"
            style={{ width: '100%' }}
          >
            Non, quitter le site
          </button>
        </div>
      </div>
    </div>
  );
}
