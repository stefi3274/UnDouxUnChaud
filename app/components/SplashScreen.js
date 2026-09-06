'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [disparait, setDisparait] = useState(false);

  useEffect(() => {
    const dejaVu = sessionStorage.getItem('udc_splash_vu');
    if (dejaVu === '1') {
      setVisible(false);
      return;
    }

    const timerFondu = setTimeout(() => setDisparait(true), 2600);
    const timerFin = setTimeout(() => {
      sessionStorage.setItem('udc_splash_vu', '1');
      setVisible(false);
    }, 3000);

    return () => { clearTimeout(timerFondu); clearTimeout(timerFin); };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: '#F8F3E8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disparait ? 0 : 1, transition: 'opacity 0.4s ease',
      pointerEvents: disparait ? 'none' : 'auto',
    }}>
      <img
        src="/logo.jpg"
        alt="UnDouxUnChaud"
        style={{
          width: 'min(320px, 60vw)', height: 'auto', borderRadius: 24,
          boxShadow: '0 20px 60px rgba(43,38,32,0.18)',
          animation: 'udc-splash-entree 0.6s ease-out',
        }}
      />
      <style>{`
        @keyframes udc-splash-entree {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
