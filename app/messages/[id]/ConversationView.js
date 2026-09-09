'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { urlAvatar } from '@/lib/avatar';
import EmojiPicker from '@/app/components/EmojiPicker';
import { compresserImage } from '@/lib/compresserImage';

export default function ConversationView({ conversationId, moi }) {
  const [meta, setMeta] = useState(null); // { autreUtilisateur, verrouillee, aPinDefini }
  const [deverrouille, setDeverrouille] = useState(false);
  const [pinSaisi, setPinSaisi] = useState('');
  const [afficherPinSaisi, setAfficherPinSaisi] = useState(false);
  const [erreurPin, setErreurPin] = useState('');

  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState('');
  const [chargement, setChargement] = useState(true);
  const [envoiImage, setEnvoiImage] = useState(false);
  const [erreur, setErreur] = useState('');
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [modaleSignal, setModaleSignal] = useState(false);
  const [raisonSignal, setRaisonSignal] = useState('');
  const [modaleCreerPin, setModaleCreerPin] = useState(false);
  const [messageEnEditionId, setMessageEnEditionId] = useState(null);
  const [texteEdition, setTexteEdition] = useState('');
  const [messageMenuOuvertId, setMessageMenuOuvertId] = useState(null);
  const [repondA, setRepondA] = useState(null);
  const [reactionsOuvertesId, setReactionsOuvertesId] = useState(null);
  const [typeCreation, setTypeCreation] = useState('pin');
  const [nouveauPin, setNouveauPin] = useState('');
  const [afficherNouveauPin, setAfficherNouveauPin] = useState(false);
  const [erreurCreerPin, setErreurCreerPin] = useState('');
  const finDeFil = useRef(null);
  const inputRef = useRef(null);
  const fichierRef = useRef(null);

  async function chargerMeta() {
    const res = await fetch(`/api/messages/${conversationId}/meta`);
    if (!res.ok) { setErreur('Conversation introuvable.'); setChargement(false); return; }
    const data = await res.json();
    setMeta(data);
    setChargement(false);
  }

  useEffect(() => { chargerMeta(); }, [conversationId]);

  async function chargerMessages(silencieux = false) {
    if (!silencieux) setChargement(true);
    const res = await fetch(`/api/messages/${conversationId}`);
    if (!res.ok) { setErreur('Conversation introuvable.'); setChargement(false); return; }
    const data = await res.json();
    setMessages((prev) => {
      const enAttente = prev.filter((m) => m.id?.toString().startsWith('temp-'));
      return [...(data.messages || []), ...enAttente];
    });
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

  function insererEmoji(emoji) {
    const input = inputRef.current;
    const debut = input?.selectionStart ?? texte.length;
    const fin = input?.selectionEnd ?? texte.length;
    const nouveau = texte.slice(0, debut) + emoji + texte.slice(fin);
    setTexte(nouveau);
    requestAnimationFrame(() => {
      input?.focus();
      const position = debut + emoji.length;
      input?.setSelectionRange(position, position);
    });
  }

  async function envoyerImage(e) {
    const fichier = e.target.files?.[0];
    e.target.value = '';
    if (!fichier) return;

    setEnvoiImage(true);
    setErreur('');
    try {
      const compressee = await compresserImage(fichier);
      const fd = new FormData();
      fd.append('file', compressee);

      const res = await fetch(`/api/messages/${conversationId}/image`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi.");

      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setErreur(err.message || "Erreur lors de l'envoi de l'image.");
    } finally {
      setEnvoiImage(false);
    }
  }

  function commencerReponse(m) {
    setRepondA(m);
    setMessageMenuOuvertId(null);
    inputRef.current?.focus();
  }

  async function reagir(messageId, emoji) {
    setReactionsOuvertesId(null);
    // Mise à jour optimiste simple : on relance juste un chargement silencieux après coup.
    try {
      await fetch(`/api/messages/${conversationId}/${messageId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      chargerMessages(true);
    } catch {
      // silencieux : une réaction manquée n'est pas critique
    }
  }

  async function envoyer(e) {
    e.preventDefault();
    const contenuEnvoye = texte.trim();
    if (!contenuEnvoye) return;

    const repondAEnvoye = repondA;
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: tempId, sender_id: moi.id, contenu: contenuEnvoye, image_path: null,
      created_at: new Date().toISOString(), modifie_le: null, supprime: false, lu: false,
      enAttente: true, messageOriginal: repondAEnvoye, reactions: [], maReaction: null,
    }]);
    setTexte('');
    setRepondA(null);
    setErreur('');

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: contenuEnvoye, repond_a: repondAEnvoye?.id || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi.");
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
    } catch (err) {
      setErreur(err.message || "Erreur lors de l'envoi.");
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, enAttente: false, echoue: true } : m)));
    }
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

  function commencerEdition(m) {
    setMessageEnEditionId(m.id);
    setTexteEdition(m.contenu || '');
  }

  async function confirmerEdition(id) {
    const nouveauContenu = texteEdition.trim();
    if (!nouveauContenu) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, contenu: nouveauContenu, modifie_le: new Date().toISOString() } : m)));
    setMessageEnEditionId(null);
    try {
      const res = await fetch(`/api/messages/${conversationId}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: nouveauContenu }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la modification.');
      }
    } catch {
      alert('Erreur lors de la modification.');
    }
  }

  async function supprimerMessage(id) {
    if (!confirm('Supprimer ce message ?')) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, supprime: true, contenu: null, image_path: null } : m)));
    try {
      await fetch(`/api/messages/${conversationId}/${id}`, { method: 'DELETE' });
    } catch {
      // le message reste marqué supprimé côté affichage même si la requête échoue en tâche de fond
    }
  }

  async function supprimerConversation() {
    setMenuOuvert(false);
    if (!confirm('Supprimer définitivement cette conversation ? Tous les messages seront effacés pour toi et pour l\'autre personne, sans possibilité de retour en arrière.')) return;
    await fetch(`/api/messages/${conversationId}`, { method: 'DELETE' });
    window.location.href = '/messages';
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
      const contenu = m.supprime
        ? '[message supprimé]'
        : m.image_path ? `[image]${m.contenu ? ' ' + m.contenu : ''}` : m.contenu;
      return `[${date}] @${auteur} : ${contenu}`;
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
          <div style={{ position: 'relative', width: meta?.typeVerrou === 'pin' ? 120 : 220, margin: '0 auto' }}>
            <input
              type={afficherPinSaisi ? 'text' : 'password'}
              inputMode={meta?.typeVerrou === 'pin' ? 'numeric' : 'text'}
              maxLength={meta?.typeVerrou === 'pin' ? 4 : undefined}
              value={pinSaisi}
              onChange={(e) => setPinSaisi(meta?.typeVerrou === 'pin' ? e.target.value.replace(/\D/g, '') : e.target.value)}
              autoFocus
              placeholder={meta?.typeVerrou === 'pin' ? '' : 'Mot de passe'}
              style={{
                display: 'block', width: '100%', padding: '10px 40px 10px 12px',
                fontSize: '1.1rem', letterSpacing: meta?.typeVerrou === 'pin' ? '0.3em' : 'normal',
                textAlign: 'center', border: '1px solid #DDD2BC', borderRadius: 10, boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setAfficherPinSaisi((v) => !v)}
              aria-label={afficherPinSaisi ? 'Masquer' : 'Afficher'}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', padding: 4, lineHeight: 1,
              }}
            >
              {afficherPinSaisi ? '🙈' : '👁️'}
            </button>
          </div>
          {erreurPin && <p style={{ color: '#B23A2E', fontSize: '0.8rem', marginTop: 8 }}>{erreurPin}</p>}
          <button type="submit" className="btn-primary" style={{ border: 'none', marginTop: 16 }}>
            Déverrouiller
          </button>
        </form>
        <Link href="/messages" style={{ display: 'block', marginTop: 20, fontSize: '0.85rem', color: '#6B6255' }}>
          ⬅️ Retour aux messages
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0', borderBottom: '1px solid #DDD2BC',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/messages" aria-label="Retour aux messages" style={{
            fontSize: '1.1rem', textDecoration: 'none', color: '#2B2620',
            border: '1px solid #DDD2BC', borderRadius: '50%', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>⬅️</Link>
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
              <button type="button" onClick={supprimerConversation} style={{ ...itemMenuStyle, color: '#B23A2E' }}>
                🗑️ Supprimer la conversation
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <p style={{ color: '#6B6255', textAlign: 'center', marginTop: 20 }}>
            Dis bonjour à @{meta?.autreUtilisateur?.pseudo} 👋
          </p>
        )}
        {messages.map((m) => {
          const estMoi = m.sender_id === moi.id;
          const enEdition = messageEnEditionId === m.id;

          if (m.supprime) {
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: estMoi ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: 16,
                  background: 'transparent', border: '1px dashed #DDD2BC',
                  color: '#6B6255', fontStyle: 'italic', fontSize: '0.85rem',
                }}>
                  Message supprimé
                </div>
              </div>
            );
          }

          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: estMoi ? 'flex-end' : 'flex-start', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: estMoi ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6, width: '100%' }}>
                {!estMoi && (
                  <MenuMessage
                    m={m} estMoi={estMoi} enEdition={enEdition}
                    ouvert={messageMenuOuvertId === m.id}
                    reactionsOuvertes={reactionsOuvertesId === m.id}
                    onToggleMenu={() => setMessageMenuOuvertId(messageMenuOuvertId === m.id ? null : m.id)}
                    onToggleReactions={() => setReactionsOuvertesId(reactionsOuvertesId === m.id ? null : m.id)}
                    onRepondre={() => commencerReponse(m)}
                    onReagir={(emoji) => reagir(m.id, emoji)}
                  />
                )}

                <div style={{
                  maxWidth: '75%', padding: m.image_path ? 6 : '10px 14px', borderRadius: 16,
                  background: estMoi ? '#0A5F63' : '#F8F3E8',
                  color: estMoi ? '#fff' : '#2B2620',
                  borderBottomRightRadius: estMoi ? 4 : 16,
                  borderBottomLeftRadius: estMoi ? 16 : 4,
                  fontSize: '0.92rem', lineHeight: 1.4, whiteSpace: 'pre-wrap',
                  opacity: m.enAttente ? 0.6 : 1,
                }}>
                  {m.messageOriginal && (
                    <div style={{
                      borderLeft: `3px solid ${estMoi ? 'rgba(255,255,255,0.5)' : '#0A5F63'}`,
                      background: estMoi ? 'rgba(255,255,255,0.12)' : 'rgba(10,95,99,0.08)',
                      padding: '6px 10px', borderRadius: 8, marginBottom: 6, fontSize: '0.82rem',
                      opacity: 0.9,
                    }}>
                      {m.messageOriginal.supprime
                        ? <em>Message supprimé</em>
                        : m.messageOriginal.image_path
                          ? '📷 Image'
                          : (m.messageOriginal.contenu || '').slice(0, 100)}
                    </div>
                  )}

                  {m.image_path && m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt=""
                      style={{ display: 'block', maxWidth: '100%', maxHeight: 320, borderRadius: 12, cursor: 'pointer' }}
                      onClick={() => window.open(m.imageUrl, '_blank')}
                    />
                  )}

                  {enEdition ? (
                    <div style={{ minWidth: 200 }}>
                      <textarea
                        value={texteEdition}
                        onChange={(e) => setTexteEdition(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%', minHeight: 60, padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)',
                          background: 'rgba(255,255,255,0.15)', color: 'inherit', fontSize: '0.9rem', resize: 'vertical',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <button type="button" onClick={() => confirmerEdition(m.id)} style={{ background: '#fff', color: '#0A5F63', border: 'none', borderRadius: 100, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                          Enregistrer
                        </button>
                        <button type="button" onClick={() => setMessageEnEditionId(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.5)', color: 'inherit', borderRadius: 100, padding: '4px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {m.contenu && (
                        <div style={{ padding: m.image_path ? '8px 6px 2px' : 0 }}>{m.contenu}</div>
                      )}
                      {(m.modifie_le || m.enAttente || m.echoue) && (
                        <div style={{ fontSize: '0.68rem', opacity: 0.7, marginTop: 3, padding: m.image_path ? '0 6px' : 0 }}>
                          {m.echoue ? "⚠️ échec de l'envoi" : m.enAttente ? 'envoi...' : '(modifié)'}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {estMoi && !enEdition && (
                  <MenuMessage
                    m={m} estMoi={estMoi} enEdition={enEdition}
                    ouvert={messageMenuOuvertId === m.id}
                    reactionsOuvertes={reactionsOuvertesId === m.id}
                    onToggleMenu={() => setMessageMenuOuvertId(messageMenuOuvertId === m.id ? null : m.id)}
                    onToggleReactions={() => setReactionsOuvertesId(reactionsOuvertesId === m.id ? null : m.id)}
                    onRepondre={() => commencerReponse(m)}
                    onReagir={(emoji) => reagir(m.id, emoji)}
                    onModifier={() => { commencerEdition(m); setMessageMenuOuvertId(null); }}
                    onSupprimer={() => { supprimerMessage(m.id); setMessageMenuOuvertId(null); }}
                  />
                )}
              </div>

              {m.reactions?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {m.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      type="button"
                      onClick={() => reagir(m.id, r.emoji)}
                      style={{
                        background: r.emoji === m.maReaction ? '#E3F1EF' : '#fff',
                        border: `1px solid ${r.emoji === m.maReaction ? '#0A5F63' : '#DDD2BC'}`,
                        borderRadius: 100, padding: '1px 8px', fontSize: '0.78rem', cursor: 'pointer',
                      }}
                    >
                      {r.emoji} {r.total}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={finDeFil} />
      </div>

      {repondA && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 10,
          padding: '8px 12px', marginTop: 8, fontSize: '0.82rem', color: '#2B2620',
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, color: '#0A5F63', fontSize: '0.75rem' }}>
              Réponse à {repondA.sender_id === moi.id ? 'toi-même' : `@${meta?.autreUtilisateur?.pseudo}`}
            </div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {repondA.image_path ? '📷 Image' : repondA.contenu}
            </div>
          </div>
          <button type="button" onClick={() => setRepondA(null)} style={{ background: 'none', border: 'none', color: '#6B6255', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>
            ✕
          </button>
        </div>
      )}

      {erreur && <p style={{ color: '#B23A2E', fontSize: '0.85rem' }}>{erreur}</p>}

      <form onSubmit={envoyer} style={{ display: 'flex', gap: 10, padding: '14px 0', borderTop: '1px solid #DDD2BC', flexShrink: 0 }}>
        <input ref={fichierRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={envoyerImage} style={{ display: 'none' }} />
        <button
          type="button"
          onClick={() => fichierRef.current?.click()}
          disabled={envoiImage}
          aria-label="Envoyer une image"
          style={{
            width: 42, height: 42, borderRadius: '50%', border: '1px solid #DDD2BC',
            background: '#fff', fontSize: '1.15rem', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {envoiImage ? '⏳' : '📎'}
        </button>
        <EmojiPicker onSelect={insererEmoji} />
        <input
          ref={inputRef}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écris un message..."
          style={{
            flex: 1, padding: '11px 14px', border: '1px solid #DDD2BC', borderRadius: 100,
            fontSize: '0.9rem', background: '#fff',
          }}
        />
        <button type="submit" disabled={!texte.trim()} className="btn-primary" style={{ borderRadius: 100, padding: '11px 20px' }}>
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

            <div style={{ position: 'relative', width: typeCreation === 'pin' ? 120 : '100%', margin: '16px auto 0' }}>
              <input
                type={afficherNouveauPin ? 'text' : 'password'}
                inputMode={typeCreation === 'pin' ? 'numeric' : 'text'}
                maxLength={typeCreation === 'pin' ? 4 : undefined}
                value={nouveauPin}
                onChange={(e) => setNouveauPin(typeCreation === 'pin' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                placeholder={typeCreation === 'pin' ? '' : '6 caractères minimum'}
                autoFocus
                style={{
                  display: 'block', width: '100%',
                  padding: '10px 40px 10px 12px', fontSize: typeCreation === 'pin' ? '1.1rem' : '0.95rem',
                  letterSpacing: typeCreation === 'pin' ? '0.3em' : 'normal',
                  textAlign: typeCreation === 'pin' ? 'center' : 'left',
                  border: '1px solid #DDD2BC', borderRadius: 10, boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setAfficherNouveauPin((v) => !v)}
                aria-label={afficherNouveauPin ? 'Masquer' : 'Afficher'}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', padding: 4, lineHeight: 1,
                }}
              >
                {afficherNouveauPin ? '🙈' : '👁️'}
              </button>
            </div>
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

const itemMenuStylePetit = {
  display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px',
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: '#2B2620',
};

const REACTIONS_RAPIDES = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function MenuMessage({ m, estMoi, ouvert, reactionsOuvertes, onToggleMenu, onToggleReactions, onRepondre, onReagir, onModifier, onSupprimer }) {
  return (
    <div style={{ position: 'relative', display: 'flex', gap: 0, flexShrink: 0 }}>
      <button
        type="button"
        onClick={onToggleReactions}
        style={{ background: 'none', border: 'none', color: '#6B6255', cursor: 'pointer', fontSize: '0.95rem', padding: 4 }}
        aria-label="Réagir"
      >
        🙂
      </button>
      <button
        type="button"
        onClick={onToggleMenu}
        style={{ background: 'none', border: 'none', color: '#6B6255', cursor: 'pointer', fontSize: '0.9rem', padding: 4 }}
        aria-label="Options du message"
      >
        ⋯
      </button>

      {reactionsOuvertes && (
        <div style={{
          position: 'absolute', bottom: '110%', left: estMoi ? 'auto' : 0, right: estMoi ? 0 : 'auto',
          background: '#fff', border: '1px solid #DDD2BC', borderRadius: 100,
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)', display: 'flex', gap: 4, padding: '6px 8px', zIndex: 15,
        }}>
          {REACTIONS_RAPIDES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReagir(emoji)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.15rem', padding: 2, lineHeight: 1 }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {ouvert && (
        <div style={{
          position: 'absolute', bottom: '110%', left: estMoi ? 'auto' : 0, right: estMoi ? 0 : 'auto',
          background: '#fff', border: '1px solid #DDD2BC', borderRadius: 10,
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 150, zIndex: 15,
        }}>
          <button type="button" onClick={onRepondre} style={itemMenuStylePetit}>
            ↩️ Répondre
          </button>
          {estMoi && !m.image_path && (
            <button type="button" onClick={onModifier} style={itemMenuStylePetit}>
              ✏️ Modifier
            </button>
          )}
          {estMoi && (
            <button type="button" onClick={onSupprimer} style={{ ...itemMenuStylePetit, color: '#B23A2E' }}>
              🗑️ Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
