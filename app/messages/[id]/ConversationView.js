'use client';

import { useEffect, useRef, useState } from 'react';
import { urlAvatar } from '@/lib/avatar';

export default function ConversationView({ conversationId, moi }) {
  const [meta, setMeta] = useState(null); // { autreUtilisateur, verrouillee, aPinDefini }
  const [deverrouille, setDeverrouille] = useState(false);
  const [pinSaisi, setPinSaisi] = useState('');
  const [erreurPin, setErreurPin] = useState('');

  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState('');
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [modaleSignal, setModaleSignal] = useState(false);
  const [raisonSignal, setRaisonSignal] = useState('');
  const [modaleCreerPin, setModaleCreerPin] = useState(false);
  const [typeCreation, setTypeCreation] = useState('pin');
  const [nouveauPin, setNouveauPin] = useState('');
  const [erreurCreerPin, setErreurCreerPin] = useState('');
  const finDeFil = useRef(null);

  async function chargerMeta() {
    const res = await fetch(`/api/messages/${conversationId}/meta`);
    if (!res.ok) { setErreur('Conversation introuvable.'); setChargement(false); return; }
    const data = await res.json();
    setMeta(data);
    if (!data.verrouillee) setChargement(false);
  }

  useEffect(() => { chargerMeta(); }, [conversationId]);

  async function chargerMessages(silencieux = false) {
    if (!silencieux) setChargement(true);
    const res = await fetch(`/api/messages/${conversationId}`);
    if (!res.ok) { setErreur('Conversation introuvable.'); setChargement(false); return; }
    const data = await res.json();
    setMessages(data.messages || []);
    setChargement(false);
  }

  useEffect(() => {
    if (!meta) return;
    if (meta.verrouillee && !deverrouille) return; // en attente du code
    chargerMessages();
    const intervalle = setInterval(() => chargerMessages(true), 3000);
    return () => clearInterval(intervalle);
  }, [meta, deverrouille]);

  useEffect(() => {
    finDeFil.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function verifierPin(e) {
    e.preventDefault();
    setErreurPin('');
    const res = await fetch('/api/messages/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: pinSaisi }),
    });
    const data = await res.json();
    if (data.valide) {
      setDeverrouille(true);
    } else {
      setErreurPin('Code incorrect.');
      setPinSaisi('');
    }
  }

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
    if (!res.ok) { setErreur(data.error || "Erreur lors de l'envoi."); return; }
    setTexte('');
    setMessages((prev) => [...prev, data.message]);
  }

  async function bloquer() {
    if (!meta?.autreUtilisateur) return;
    if (!confirm(`Bloquer @${meta.autreUtilisateur.pseudo} ? Vous ne pourrez plus vous écrire.`)) return;
    await fetch('/api/users/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: meta.autreUtilisateur.id }),
    });
    setMenuOuvert(false);
    window.location.href = '/messages';
  }

  async function envoyerSignalement() {
    if (!meta?.autreUtilisateur) return;
    await fetch('/api/users/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: meta.autreUtilisateur.id, conversation_id: conversationId, raison: raisonSignal }),
    });
    setModaleSignal(false);
    setRaisonSignal('');
    setMenuOuvert(false);
    alert("Signalement envoyé, l'équipe va l'examiner.");
  }

  async function basculerVerrou() {
    setMenuOuvert(false);
    const cible = !meta.verrouillee;
    const res = await fetch(`/api/messages/${conversationId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verrouille: cible }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.codeRequis) { setModaleCreerPin(true); return; }
      alert(data.error || 'Erreur.');
      return;
    }
    if (cible) {
      window.location.href = '/messages';
    } else {
      setMeta((m) => ({ ...m, verrouillee: false }));
    }
  }

  async function creerPinEtVerrouiller() {
    setErreurCreerPin('');
    if (typeCreation === 'pin' && !/^\d{4}$/.test(nouveauPin)) {
      setErreurCreerPin('4 chiffres exactement.');
      return;
    }
    if (typeCreation === 'password' && nouveauPin.length < 6) {
      setErreurCreerPin('6 caractères minimum.');
      return;
    }
    const res = await fetch('/api/messages/lock-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: nouveauPin, type: typeCreation }),
    });
    if (!res.ok) {
      const data = await res.json();
      setErreurCreerPin(data.error || 'Erreur.');
      return;
    }
    setModaleCreerPin(false);
    setNouveauPin('');
    await fetch(`/api/messages/${conversationId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verrouille: true }),
    });
    window.location.href = '/messages';
  }

  async function exporter() {
    setMenuOuvert(false);
    const lignes = messages.map((m) => {
      const auteur = m.sender_id === moi.id ? moi.pseudo : meta.autreUtilisateur.pseudo;
      const date = new Date(m.created_at).toLocaleString('fr-FR');
      return `[${date}] @${auteur} : ${m.contenu}`;
    });
    const transcript = `Conversation avec @${meta.autreUtilisateur.pseudo} — UnDouxUnChaud\nExportée le ${new Date().toLocaleString('fr-FR')}\n\n${lignes.join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Conversation avec @${meta.autreUtilisateur.pseudo}`, text: transcript });
      } catch {
        // partage annulé par la personne, rien à faire
      }
    } else {
      try {
        await navigator.clipboard.writeText(transcript);
        alert('Conversation copiée ! Colle-la dans Gmail, WhatsApp Web ou où tu veux.');
      } catch {
        const lien = document.createElement('a');
        lien.href = `data:text/plain;charset=utf-8,${encodeURIComponent(transcript)}`;
        lien.download = `conversation-${meta.autreUtilisateur.pseudo}.txt`;
        lien.click();
      }
    }
  }

  if (chargement) return <p style={{ color: '#6B6255', marginTop: 20 }}>Chargement...</p>;
  if (erreur && !meta) return <p style={{ color: '#B23A2E', marginTop: 20 }}>{erreur}</p>;

  if (meta?.verrouillee && !deverrouille) {
    return (
      <div style={{ maxWidth: 320, margin: '15vh auto 0', textAlign: 'center' }}>
        <div style={{ fontSize: '2.4rem' }}>🔒</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.2rem', marginTop: 10 }}>Conversation verrouillée</h1>
        <form onSubmit={verifierPin} style={{ marginTop: 20 }}>
          <input
            type="password"
            inputMode={meta?.typeVerrou === 'pin' ? 'numeric' : 'text'}
            maxLength={meta?.typeVerrou === 'pin' ? 4 : undefined}
            value={pinSaisi}
            onChange={(e) => setPinSaisi(meta?.typeVerrou === 'pin' ? e.target.value.replace(/\D/g, '') : e.target.value)}
            autoFocus
            placeholder={meta?.typeVerrou === 'pin' ? '' : 'Mot de passe'}
            style={{
              display: 'block', width: meta?.typeVerrou === 'pin' ? 120 : 220, margin: '0 auto', padding: '10px 12px',
              fontSize: '1.1rem', letterSpacing: meta?.typeVerrou === 'pin' ? '0.3em' : 'normal',
              textAlign: 'center', border: '1px solid #DDD2BC', borderRadius: 10,
            }}
          />
          {erreurPin && <p style={{ color: '#B23A2E', fontSize: '0.8rem', marginTop: 8 }}>{erreurPin}</p>}
          <button type="submit" className="btn-primary" style={{ border: 'none', marginTop: 16 }}>
            Déverrouiller
          </button>
        </form>
        <a href="/messages" style={{ display: 'block', marginTop: 20, fontSize: '0.85rem', color: '#6B6255' }}>
          ⬅️ Retour aux messages
        </a>
      </div>
    );
  }

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
          <span style={{ fontWeight: 700, fontFamily: 'Fraunces, serif', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            {urlAvatar(meta?.autreUtilisateur?.avatar_path) ? (
              <img src={urlAvatar(meta.autreUtilisateur.avatar_path)} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
            ) : null}
            @{meta?.autreUtilisateur?.pseudo}
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
              overflow: 'hidden', minWidth: 200, zIndex: 10,
            }}>
              <button type="button" onClick={basculerVerrou} style={itemMenuStyle}>
                {meta?.verrouillee ? '🔓 Déverrouiller' : '🔒 Verrouiller'}
              </button>
              <button type="button" onClick={exporter} style={itemMenuStyle}>
                📤 Exporter
              </button>
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
            Dis bonjour à @{meta?.autreUtilisateur?.pseudo} 👋
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
            <h3 style={{ fontFamily: 'Fraunces, serif' }}>Signaler @{meta?.autreUtilisateur?.pseudo}</h3>
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

      {modaleCreerPin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '6vw',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif' }}>Crée ton verrou</h3>
            <p style={{ color: '#6B6255', fontSize: '0.85rem', marginTop: 6 }}>
              Demandé à chaque ouverture d'une conversation verrouillée.
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => { setTypeCreation('pin'); setNouveauPin(''); setErreurCreerPin(''); }}
                style={{
                  padding: '8px 16px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${typeCreation === 'pin' ? '#0A5F63' : '#DDD2BC'}`,
                  background: typeCreation === 'pin' ? '#0A5F63' : '#fff',
                  color: typeCreation === 'pin' ? '#fff' : '#2B2620',
                }}
              >
                Code PIN
              </button>
              <button
                type="button"
                onClick={() => { setTypeCreation('password'); setNouveauPin(''); setErreurCreerPin(''); }}
                style={{
                  padding: '8px 16px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${typeCreation === 'password' ? '#0A5F63' : '#DDD2BC'}`,
                  background: typeCreation === 'password' ? '#0A5F63' : '#fff',
                  color: typeCreation === 'password' ? '#fff' : '#2B2620',
                }}
              >
                Mot de passe
              </button>
            </div>

            <input
              type="password"
              inputMode={typeCreation === 'pin' ? 'numeric' : 'text'}
              maxLength={typeCreation === 'pin' ? 4 : undefined}
              value={nouveauPin}
              onChange={(e) => setNouveauPin(typeCreation === 'pin' ? e.target.value.replace(/\D/g, '') : e.target.value)}
              placeholder={typeCreation === 'pin' ? '' : '6 caractères minimum'}
              autoFocus
              style={{
                display: 'block', width: typeCreation === 'pin' ? 120 : '100%', margin: '16px auto 0',
                padding: '10px 12px', fontSize: typeCreation === 'pin' ? '1.1rem' : '0.95rem',
                letterSpacing: typeCreation === 'pin' ? '0.3em' : 'normal',
                textAlign: typeCreation === 'pin' ? 'center' : 'left',
                border: '1px solid #DDD2BC', borderRadius: 10, boxSizing: 'border-box',
              }}
            />
            {erreurCreerPin && <p style={{ color: '#B23A2E', fontSize: '0.8rem', marginTop: 8 }}>{erreurCreerPin}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setModaleCreerPin(false)} className="btn-outline" style={{ flex: 1 }}>
                Annuler
              </button>
              <button type="button" onClick={creerPinEtVerrouiller} className="btn-primary" style={{ flex: 1, border: 'none' }}>
                Créer et verrouiller
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
