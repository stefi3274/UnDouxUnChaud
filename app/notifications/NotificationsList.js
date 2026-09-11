'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function texteNotification(n) {
  const pseudo = n.acteur?.pseudo ? `@${n.acteur.pseudo}` : 'Quelqu\'un';
  const titre = n.udc_textes?.titre;
  switch (n.type) {
    case 'like': return `${pseudo} a aimé ton texte${titre ? ` « ${titre} »` : ''}.`;
    case 'commentaire': return `${pseudo} a commenté ton texte${titre ? ` « ${titre} »` : ''}.`;
    case 'nouveau_texte': return `${pseudo} a publié un nouveau texte${titre ? ` : « ${titre} »` : ''}.`;
    case 'nouvel_abonne': return `${pseudo} s'est abonné·e à toi.`;
    default: return 'Nouvelle notification.';
  }
}

function lienNotification(n) {
  if (n.texte_id) return `/textes/${n.texte_id}`;
  if (n.type === 'nouvel_abonne' && n.acteur?.pseudo) return `/auteur/${n.acteur.pseudo}`;
  return null;
}

export default function NotificationsList() {
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []))
      .then(() => fetch('/api/notifications', { method: 'POST' }))
      .catch(() => {});
  }, []);

  if (notifications === null) {
    return <p style={{ color: '#6B6255', marginTop: 20 }}>Chargement...</p>;
  }
  if (notifications.length === 0) {
    return <p style={{ color: '#6B6255', marginTop: 20 }}>Aucune notification pour l'instant.</p>;
  }

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {notifications.map((n) => {
        const lien = lienNotification(n);
        const contenu = (
          <div style={{
            background: n.lu ? '#fff' : '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 12,
            padding: '14px 16px', fontSize: '0.9rem',
          }}>
            {texteNotification(n)}
            <div style={{ fontSize: '0.75rem', color: '#6B6255', marginTop: 4 }}>
              {new Date(n.created_at).toLocaleString('fr-FR')}
            </div>
          </div>
        );
        return lien ? (
          <Link key={n.id} href={lien} style={{ textDecoration: 'none', color: 'inherit' }}>{contenu}</Link>
        ) : (
          <div key={n.id}>{contenu}</div>
        );
      })}
    </div>
  );
}
