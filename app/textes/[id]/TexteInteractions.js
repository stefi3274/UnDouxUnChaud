'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TexteInteractions({ texteId, auteurId, initialLikes, comments, user }) {
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function handleLike() {
    if (!user) { router.push('/connexion'); return; }
    const res = await fetch('/api/textes/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte_id: texteId }),
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikes((n) => n + (data.liked ? 1 : -1));
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!user) { router.push('/connexion'); return; }
    if (!commentaire.trim()) return;

    setEnvoi(true);
    await fetch('/api/textes/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte_id: texteId, contenu: commentaire, parent_id: replyTo }),
    });
    setEnvoi(false);
    setCommentaire('');
    setReplyTo(null);
    router.refresh();
  }

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (id) => comments.filter((c) => c.parent_id === id);

  function CommentItem({ c }) {
    const isAuthor = c.user_id === auteurId;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>@{c.udc_users?.pseudo}</span>
          {isAuthor && (
            <span style={{
              background: '#0E7C81', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
              padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase',
            }}>Auteur</span>
          )}
          <span style={{ fontSize: '0.78rem', color: '#6B6255' }}>
            {new Date(c.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <p style={{ fontSize: '0.92rem', marginTop: 6 }}>{c.contenu}</p>
        <button onClick={() => setReplyTo(c.id)} style={{
          background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600,
          color: '#6B6255', cursor: 'pointer', padding: 0, marginTop: 6,
        }}>Répondre</button>

        {repliesOf(c.id).map((r) => (
          <div key={r.id} style={{ marginLeft: 32, marginTop: 14 }}>
            <CommentItem c={r} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, marginTop: 32,
        paddingTop: 22, borderTop: '1px solid #DDD2BC',
      }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: liked ? '#D98CA0' : '#F8F3E8',
          border: '1px solid #DDD2BC', borderRadius: 100, padding: '10px 20px',
          fontWeight: 600, color: liked ? '#fff' : '#2B2620', cursor: 'pointer',
        }}>
          ♥ {likes}
        </button>
        <span style={{ color: '#6B6255', fontSize: '0.88rem' }}>💬 {comments.length} commentaires</span>
      </div>

      <div style={{ marginTop: 44 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', marginBottom: 20 }}>Commentaires</h2>

        {user ? (
          <form onSubmit={handleComment} style={{
            background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 14, padding: 18, marginBottom: 28,
          }}>
            {replyTo && (
              <p style={{ fontSize: '0.8rem', color: '#6B6255', marginBottom: 8 }}>
                Réponse à un commentaire —{' '}
                <button type="button" onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: '#B23A2E', cursor: 'pointer', padding: 0 }}>
                  annuler
                </button>
              </p>
            )}
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Écris un commentaire..."
              style={{ width: '100%', minHeight: 80, padding: 10, border: '1px solid #DDD2BC', borderRadius: 10 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" disabled={envoi} style={{
                background: '#2B2620', color: '#EFE7D8', padding: '10px 20px',
                borderRadius: 100, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                {envoi ? 'Envoi...' : 'Publier'}
              </button>
            </div>
          </form>
        ) : (
          <p style={{
            background: '#F8F3E8', border: '1px dashed #DDD2BC', borderRadius: 14,
            padding: 20, textAlign: 'center', color: '#6B6255', marginBottom: 28,
          }}>
            <a href="/connexion" style={{ color: '#0A5F63', fontWeight: 700 }}>Connecte-toi</a> pour aimer ou commenter ce texte.
          </p>
        )}

        {topLevel.map((c) => <CommentItem key={c.id} c={c} />)}
      </div>
    </div>
  );
}
