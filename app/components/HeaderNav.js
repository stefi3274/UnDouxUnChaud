'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function HeaderNav({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const estAccueil = pathname === '/';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 16, flexWrap: 'wrap', padding: '20px 6vw', borderBottom: '1px solid #DDD2BC',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {!estAccueil && (
          <a href="/" aria-label="Retour à l'accueil" style={{
            fontSize: '1.2rem', textDecoration: 'none', color: '#2B2620',
            border: '1px solid #DDD2BC', borderRadius: '50%', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>⬅️</a>
        )}
        <div>
          <div className="site-logo">Un<span>Doux</span>UnChaud</div>
          <div className="site-sub">Magazine littéraire</div>
        </div>
      </div>

      {user ? (
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {pathname !== '/ecrire' && (
            <a href="/ecrire" style={{ color: '#2B2620', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden="true">✍️</span> Écrire
            </a>
          )}
          {pathname !== '/profil' && (
            <a href="/profil" style={{ color: '#2B2620', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden="true">👤</span> Mon profil
            </a>
          )}
          {user.role === 'admin' && pathname !== '/admin' && (
            <a href="/admin" style={{ color: '#0A5F63', textDecoration: 'none', fontWeight: 700 }}>Admin</a>
          )}
          <span style={{ color: '#6B6255', fontSize: '0.85rem' }}>@{user.pseudo}</span>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 18px' }}>
            Se déconnecter
          </button>
        </nav>
      ) : (
        <nav style={{ display: 'flex', gap: 16 }}>
          {pathname !== '/inscription' && (
            <a href="/inscription" style={{ color: '#2B2620', textDecoration: 'none', fontWeight: 600 }}>
              Créer un compte
            </a>
          )}
          {pathname !== '/connexion' && (
            <a href="/connexion" className="btn-turquoise">
              Se connecter
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
