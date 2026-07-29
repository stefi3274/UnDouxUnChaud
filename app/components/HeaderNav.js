'use client';

import { useRouter } from 'next/navigation';

export default function HeaderNav({ user }) {
  const router = useRouter();

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
      <div>
        <div className="site-logo">Un<span>Doux</span>UnChaud</div>
        <div className="site-sub">Magazine littéraire</div>
      </div>

      {user ? (
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/ecrire" style={{ color: '#2B2620', textDecoration: 'none', fontWeight: 600 }}>Écrire</a>
          <a href="/profil" style={{ color: '#2B2620', textDecoration: 'none', fontWeight: 600 }}>Mon profil</a>
          {user.role === 'admin' && (
            <a href="/admin" style={{ color: '#0A5F63', textDecoration: 'none', fontWeight: 700 }}>Admin</a>
          )}
          <span style={{ color: '#6B6255', fontSize: '0.85rem' }}>@{user.pseudo}</span>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 18px' }}>
            Se déconnecter
          </button>
        </nav>
      ) : (
        <nav style={{ display: 'flex', gap: 16 }}>
          <a href="/inscription" style={{ color: '#2B2620', textDecoration: 'none', fontWeight: 600 }}>
            Créer un compte
          </a>
          <a href="/connexion" className="btn-turquoise">
            Se connecter
          </a>
        </nav>
      )}
    </header>
  );
}
