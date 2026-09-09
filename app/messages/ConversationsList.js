'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { urlAvatar } from '@/lib/avatar';

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

function LigneConversation({ c }) {
  return (
    <Link
      href={`/messages/${c.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)',
        background: '#fff', border: '1px solid #DDD2BC', borderRadius: 14, padding: '14px 16px',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: '50%', background: '#F8F3E8', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A5F63',
        overflow: 'hidden',
      }}>
        {urlAvatar(c.autreAvatar) ? (
          <img src={urlAvatar(c.autreAvatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          c.autrePseudo?.[0]?.toUpperCase() || '?'
        )}
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
    </Link>
  );
}

export default function ConversationsList() {
  const [conversations, setConversations] = useState(null);
  const [deverrouille, setDeverrouille] = useState(false);
  const [saisiePin, setSaisiePin] = useState(false);
  const [pin, setPin] = useState('');
  const [erreurPin, setErreurPin] = useState('');
  const [typeVerrou, setTypeVerrou] = useState('pin');
  const [afficherPin, setAfficherPin] = useState(false);

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

  async function verifierPin(e) {
    e.preventDefault();
    setErreurPin('');
    const res = await fetch('/api/messages/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: pin }),
    });
    const data = await res.json();
    if (data.valide) {
      setDeverrouille(true);
      setSaisiePin(false);
      setPin('');
    } else {
      setErreurPin('Code incorrect.');
    }
  }

  async function ouvrirSaisiePin() {
    const res = await fetch('/api/messages/lock-type');
    const data = await res.json();
    setTypeVerrou(data.type || 'pin');
    setSaisiePin(true);
  }

  if (conversations === null) {
    return <p style={{ color: '#6B6255', marginTop: 20 }}>Chargement...</p>;
  }

  const normales = conversations.filter((c) => !c.verrouillee);
  const verrouillees = conversations.filter((c) => c.verrouillee);

  if (conversations.length === 0) {
    return (
      <p style={{ color: '#6B6255', marginTop: 20 }}>
        Aucune conversation pour l'instant. Démarre-en une depuis la page d'un texte, en cliquant sur "💬 Message" à côté du pseudo de l'auteur·rice.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {normales.map((c) => <LigneConversation key={c.id} c={c} />)}

      {verrouillees.length > 0 && !deverrouille && !saisiePin && (
        <button
          type="button"
          onClick={ouvrirSaisiePin}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, background: '#F8F3E8',
            border: '1px dashed #DDD2BC', borderRadius: 14, padding: '14px 16px',
            cursor: 'pointer', fontWeight: 700, color: '#2B2620', fontSize: '0.9rem',
          }}
        >
          🔒 {verrouillees.length} conversation{verrouillees.length > 1 ? 's' : ''} verrouillée{verrouillees.length > 1 ? 's' : ''}
        </button>
      )}

      {saisiePin && (
        <form onSubmit={verifierPin} style={{ background: '#fff', border: '1px solid #DDD2BC', borderRadius: 14, padding: 16 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B6255' }}>
            {typeVerrou === 'pin' ? 'Code à 4 chiffres' : 'Mot de passe'}
          </label>
          <div style={{ position: 'relative', width: typeVerrou === 'pin' ? 120 : '100%', marginTop: 8 }}>
            <input
              type={afficherPin ? 'text' : 'password'}
              inputMode={typeVerrou === 'pin' ? 'numeric' : 'text'}
              maxLength={typeVerrou === 'pin' ? 4 : undefined}
              value={pin}
              onChange={(e) => setPin(typeVerrou === 'pin' ? e.target.value.replace(/\D/g, '') : e.target.value)}
              autoFocus
              style={{
                display: 'block', width: '100%',
                padding: '10px 40px 10px 12px', fontSize: typeVerrou === 'pin' ? '1.1rem' : '0.95rem',
                letterSpacing: typeVerrou === 'pin' ? '0.3em' : 'normal',
                textAlign: typeVerrou === 'pin' ? 'center' : 'left',
                border: '1px solid #DDD2BC', borderRadius: 10, boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setAfficherPin((v) => !v)}
              aria-label={afficherPin ? 'Masquer' : 'Afficher'}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', padding: 4, lineHeight: 1,
              }}
            >
              {afficherPin ? '🙈' : '👁️'}
            </button>
          </div>
          {erreurPin && <p style={{ color: '#B23A2E', fontSize: '0.8rem', marginTop: 6 }}>{erreurPin}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button type="submit" className="btn-primary" style={{ border: 'none', padding: '9px 18px', fontSize: '0.85rem' }}>
              Déverrouiller
            </button>
            <button type="button" onClick={() => { setSaisiePin(false); setPin(''); }} className="btn-outline" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {deverrouille && verrouillees.map((c) => <LigneConversation key={c.id} c={c} />)}
    </div>
  );
}
