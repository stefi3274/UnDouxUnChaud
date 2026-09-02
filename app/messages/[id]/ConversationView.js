'use client';

import { useEffect, useRef, useState } from 'react';

export default function ConversationView({ conversationId, moi }) {
  const [messages, setMessages] = useState([]);
  const [autreUtilisateur, setAutreUtilisateur] = useState(null);
  const [texte, setTexte] = useState('');
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [modaleSignal, setModaleSignal] = useState(false);
  const [raisonSignal, setRaisonSignal] = useState('');
  const finDeFil = useRef(null);

  async function charger(silencieux = false) {
    if (!silencieux) setChargement(true);
    const res = await fetch(`/api/messages/${conversationId}`);
    if (!res.ok) {
      setErreur('Conversation introuvable.');
      setChargement(false);
      return;
    }
    const data = await res.json();
    setMessages(data.messages || []);
    setAutreUtilisateur(data.autreUtilisateur);
    setChargement(false);
  }

  useEffect(() => {
    charger();
    const intervalle = setInterval(() => charger(true), 3000);
    return () => clearInterval(intervalle);
  }, [conversationId]);

  useEffect(() => {
    finDeFil.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function envoyer(e) {
    e.preventDefault();
    if (!texte.trim()) return;
    setEnvoi(true);
    setErreur('');
    const res = await fetch(`/api/messages/${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenu: texte }),
    });
    const data = await res.json();
    setEnvoi(false);
    if (!res.ok) {
      setErreur(data.error || "Erreur lors de l'envoi.");
      return;
    }
    setTexte('');
    setMessages((prev) => [...prev, data.message]);
  }

  async function bloquer() {
    if (!autreUtilisateur) return;
    if (!confirm(`Bloquer @${autreUtilisateur.pseudo} ? Vous ne pourrez plus vous écrire.`)) return;
    await fetch('/api/users/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: autreUtilisateur.id }),
    });
    setMenuOuvert(false);
    window.location.href = '/messages';
  }

  async function envoyerSignalement() {
    if (!autreUtilisateur) return;
    await fetch('/api/users/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: autreUtilisateur.id, conversation_id: conversationId, raison: raisonSignal }),
    });
    setModaleSignal(false);
    setRaisonSignal('');
    setMenuOuvert(false);
    alert("Signalement envoyé, l'équipe va l'examiner.");
  }

  if (chargement) return <p style={{ color: '#6B6255', marginTop: 20 }}>Chargement...</p>;
  if (erreur && !autreUtilisateur) return <p style={{ color: '#B23A2E', marginTop: 20 }}>{erreur}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0', borderBottom: '1px solid #DDD2BC',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/messages" aria-label="Retour aux messages" style={{
            fontSize: '1.1rem', textDecoration: 'none', color: '#2B2620',
            border: '1px solid #DDD2BC', borderRadius: '50%', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>⬅️</a>
          <span style={{ fontWeight: 700, fontFamily: 'Fraunces, serif', fontSize: '1.1rem' }}>
            @{autreUtilisateur?.pseudo}
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOuvert((v) => !v)}
            style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', padding: 6 }}
            aria-label="Options"
          >
            ⋯
          </button>
          {menuOuvert && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', background: '#fff',
              border: '1px solid #DDD2BC', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              overflow: 'hidden', minWidth: 180, zIndex: 10,
            }}>
              <button type="button" onClick={() => { setModaleSignal(true); setMenuOuvert(false); }} style={itemMenuStyle}>
                🚩 Signaler
              </button>
              <button type="button" onClick={bloquer} style={{ ...itemMenuStyle, color: '#B23A2E' }}>
                🚫 Bloquer
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <p style={{ color: '#6B6255', textAlign: 'center', marginTop: 20 }}>
            Dis bonjour à @{autreUtilisateur?.pseudo} 👋
          </p>
        )}
        {messages.map((m) => {
          const estMoi = m.sender_id === moi.id;
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: estMoi ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px', borderRadius: 16,
                background: estMoi ? '#0A5F63' : '#F8F3E8',
                color: estMoi ? '#fff' : '#2B2620',
                borderBottomRightRadius: estMoi ? 4 : 16,
                borderBottomLeftRadius: estMoi ? 16 : 4,
                fontSize: '0.92rem', lineHeight: 1.4, whiteSpace: 'pre-wrap',
              }}>
                {m.contenu}
              </div>
            </div>
          );
        })}
        <div ref={finDeFil} />
      </div>

      {erreur && <p style={{ color: '#B23A2E', fontSize: '0.85rem' }}>{erreur}</p>}

      <form onSubmit={envoyer} style={{ display: 'flex', gap: 10, padding: '14px 0', borderTop: '1px solid #DDD2BC' }}>
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écris un message..."
          style={{
            flex: 1, padding: '11px 14px', border: '1px solid #DDD2BC', borderRadius: 100,
            fontSize: '0.9rem', background: '#fff',
          }}
        />
        <button type="submit" disabled={envoi || !texte.trim()} className="btn-primary" style={{ borderRadius: 100, padding: '11px 20px' }}>
          Envoyer
        </button>
      </form>

      {modaleSignal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '6vw',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif' }}>Signaler @{autreUtilisateur?.pseudo}</h3>
            <textarea
              value={raisonSignal}
              onChange={(e) => setRaisonSignal(e.target.value)}
              placeholder="Explique brièvement le problème (optionnel)"
              style={{
                width: '100%', minHeight: 90, marginTop: 12, padding: '10px 12px',
                border: '1px solid #DDD2BC', borderRadius: 10, fontSize: '0.9rem', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setModaleSignal(false)} className="btn-outline" style={{ flex: 1 }}>
                Annuler
              </button>
              <button type="button" onClick={envoyerSignalement} className="btn-primary" style={{ flex: 1, border: 'none' }}>
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const itemMenuStyle = {
  display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px',
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', color: '#2B2620',
};
