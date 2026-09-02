'use client';

import { useEffect, useState } from 'react';

function tempsRelatif(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const j = Math.floor(h / 24);
  return `${j} j`;
}

export default function ConversationsList() {
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    let annule = false;
    async function charger() {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      if (!annule) setConversations(data.conversations || []);
    }
    charger();
    const intervalle = setInterval(charger, 5000);
    return () => { annule = true; clearInterval(intervalle); };
  }, []);

  if (conversations === null) {
    return <p style={{ color: '#6B6255', marginTop: 20 }}>Chargement...</p>;
  }

  if (conversations.length === 0) {
    return (
      <p style={{ color: '#6B6255', marginTop: 20 }}>
        Aucune conversation pour l'instant. Démarre-en une depuis la page d'un texte, en cliquant sur "💬 Message" à côté du pseudo de l'auteur·rice.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {conversations.map((c) => (
        <a
          key={c.id}
          href={`/messages/${c.id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)',
            background: '#fff', border: '1px solid #DDD2BC', borderRadius: 14, padding: '14px 16px',
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: '#F8F3E8', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A5F63',
          }}>
            {c.autrePseudo?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>@{c.autrePseudo}</span>
              <span style={{ fontSize: '0.75rem', color: '#6B6255', flexShrink: 0 }}>
                {tempsRelatif(c.dernierMessageDate)}
              </span>
            </div>
            <div style={{
              fontSize: '0.85rem', color: '#6B6255', marginTop: 2, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {c.dernierMessage || 'Nouvelle conversation'}
            </div>
          </div>
          {c.nonLus > 0 && (
            <span style={{
              background: '#0A5F63', color: '#fff', borderRadius: 100, minWidth: 20, height: 20,
              fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '0 6px', flexShrink: 0,
            }}>
              {c.nonLus}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
