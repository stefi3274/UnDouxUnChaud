'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function HeaderNav({ user }) {
  const pathname = usePathname();
  const estAccueil = pathname === '/';
  const [ouvert, setOuvert] = useState(false);
  const [nonLues, setNonLues] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => { setOuvert(false); }, [pathname]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNonLues((d.notifications || []).filter((n) => !n.lu).length))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function fermerSiExterieur(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOuvert(false);
    }
    document.addEventListener('mousedown', fermerSiExterieur);
    return () => document.removeEventListener('mousedown', fermerSiExterieur);
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // même en cas d'erreur réseau, on force quand même le retour à l'accueil
    }
    window.location.href = '/';
  }

  const lienStyle = { color: '#2B2620', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px' };
  const lienAdminStyle = { ...lienStyle, color: '#0A5F63', fontWeight: 700 };

  return (
    <header style={{ borderBottom: '1px solid #DDD2BC' }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: 16, padding: '18px 6vw', position: 'relative',
      maxWidth: 1280, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {!estAccueil && (
          <Link href="/" aria-label="Retour à l'accueil" style={{
            fontSize: '1.2rem', textDecoration: 'none', color: '#2B2620',
            border: '1px solid #DDD2BC', borderRadius: '50%', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>⬅️</Link>
        )}
        <div>
          <div className="site-logo">Un<span>Doux</span>UnChaud</div>
          <div className="site-sub">Magazine Érotique</div>
        </div>
      </div>

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-label="Menu"
          aria-expanded={ouvert}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: '1px solid #DDD2BC',
            background: ouvert ? '#2B2620' : '#fff', color: ouvert ? '#fff' : '#2B2620',
            fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, position: 'relative',
          }}
        >
          {ouvert ? '✕' : '☰'}
          {!ouvert && nonLues > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2, background: '#D4321F', color: '#fff',
              borderRadius: '50%', minWidth: 18, height: 18, fontSize: '0.65rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
              border: '2px solid #F8F3E8',
            }}>
              {nonLues > 9 ? '9+' : nonLues}
            </span>
          )}
        </button>

        {ouvert && (
          <nav style={{
            position: 'absolute', right: 0, top: '120%', background: '#fff',
            border: '1px solid #DDD2BC', borderRadius: 14, boxShadow: '0 10px 30px rgba(43,38,32,0.14)',
            padding: '10px 16px', minWidth: 220, display: 'flex', flexDirection: 'column',
            zIndex: 50,
          }}>
            {pathname !== '/recherche' && (
              <Link href="/recherche" style={lienStyle}><span aria-hidden="true">🔍</span> Recherche</Link>
            )}
            {pathname !== '/creole' && (
              <Link href="/creole" style={lienStyle}><span aria-hidden="true">HT</span> Kreyòl</Link>
            )}
            {pathname !== '/galerie' && (
              <Link href="/galerie" style={lienStyle}><span aria-hidden="true">📸</span> Galerie</Link>
            )}
            {pathname !== '/audio' && (
              <Link href="/audio" style={lienStyle}><span aria-hidden="true">🎧</span> Audio</Link>
            )}
            {pathname !== '/classement' && (
              <Link href="/classement" style={lienStyle}><span aria-hidden="true">🏆</span> Classement</Link>
            )}
            {user ? (
              <>
                <div style={{ color: '#6B6255', fontSize: '0.85rem', padding: '8px 4px', borderBottom: '1px solid #DDD2BC', marginBottom: 4 }}>
                  @{user.pseudo}
                </div>
                {pathname !== '/ecrire' && (
                  <Link href="/ecrire" style={lienStyle}><span aria-hidden="true">✍️</span> Écrire</Link>
                )}
                {pathname !== '/photos/publier' && (
                  <Link href="/photos/publier" style={lienStyle}><span aria-hidden="true">📷</span> Proposer une photo</Link>
                )}
                {pathname !== '/audio/publier' && (
                  <Link href="/audio/publier" style={lienStyle}><span aria-hidden="true">🎙️</span> Proposer un audio</Link>
                )}
                {pathname !== '/profil' && (
                  <Link href="/profil" style={lienStyle}><span aria-hidden="true">👤</span> Mon profil</Link>
                )}
                {!pathname.startsWith('/messages') && (
                  <Link href="/messages" style={lienStyle}><span aria-hidden="true">💬</span> Messages</Link>
                )}
                {pathname !== '/notifications' && (
                  <Link href="/notifications" style={lienStyle}>
                    <span aria-hidden="true">🔔</span> Notifications
                    {nonLues > 0 && (
                      <span style={{
                        background: '#D4321F', color: '#fff', borderRadius: 100, minWidth: 18, height: 18,
                        fontSize: '0.68rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', padding: '0 5px', marginLeft: 2,
                      }}>
                        {nonLues > 9 ? '9+' : nonLues}
                      </span>
                    )}
                  </Link>
                )}
                {user.role === 'admin' && (
                  <>
                    <div style={{ borderTop: '1px solid #DDD2BC', margin: '6px 0' }} />
                    {pathname !== '/admin' && (
                      <Link href="/admin" style={lienAdminStyle}><span aria-hidden="true">🛠️</span> Admin</Link>
                    )}
                    {pathname !== '/admin/posts' && (
                      <Link href="/admin/posts" style={lienAdminStyle}><span aria-hidden="true">🖼️</span> Posts</Link>
                    )}
                    {pathname !== '/admin/photos' && (
                      <Link href="/admin/photos" style={lienAdminStyle}><span aria-hidden="true">📸</span> Photos</Link>
                    )}
                    {pathname !== '/admin/audio' && (
                      <Link href="/admin/audio" style={lienAdminStyle}><span aria-hidden="true">🎧</span> Audio</Link>
                    )}
                    {pathname !== '/admin/pubs' && (
                      <Link href="/admin/pubs" style={lienAdminStyle}><span aria-hidden="true">📣</span> Pubs</Link>
                    )}
                    {pathname !== '/admin/signalements' && (
                      <Link href="/admin/signalements" style={lienAdminStyle}><span aria-hidden="true">🚩</span> Signalements</Link>
                    )}
                    {pathname !== '/admin/stats' && (
                      <Link href="/admin/stats" style={lienAdminStyle}><span aria-hidden="true">📊</span> Statistiques</Link>
                    )}
                  </>
                )}
                <div style={{ borderTop: '1px solid #DDD2BC', margin: '6px 0' }} />
                <button
                  onClick={handleLogout}
                  style={{ ...lienStyle, background: 'none', border: 'none', cursor: 'pointer', color: '#B23A2E', textAlign: 'left', width: '100%' }}
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                {pathname !== '/inscription' && (
                  <Link href="/inscription" style={lienStyle}>Créer un compte</Link>
                )}
                {pathname !== '/connexion' && (
                  <Link href="/connexion" style={lienStyle}>Se connecter</Link>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </div>
    </header>
  );
}
