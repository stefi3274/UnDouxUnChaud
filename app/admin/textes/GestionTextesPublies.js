'use client';

import { useState } from 'react';
import Link from 'next/link';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
  poemes: 'Poèmes et Lettres',
  chat_fiction: 'Chat Fiction',
};
const COULEURS_CATEGORIE = {
  un_doux: '#E85D8A',
  un_chaud: '#3F8F5C',
  piment: '#E08A1D',
  piquant: '#D4321F',
  poemes: '#9B5FC0',
  chat_fiction: '#C9A227',
};

export default function GestionTextesPublies({ textesInitial }) {
  const [textes, setTextes] = useState(textesInitial);
  const [recherche, setRecherche] = useState('');
  const [suppressionEnCoursId, setSuppressionEnCoursId] = useState(null);
  const [confirmationId, setConfirmationId] = useState(null);
  const [erreur, setErreur] = useState('');

  const textesFiltres = textes.filter((t) => {
    const q = recherche.trim().toLowerCase();
    if (!q) return true;
    return t.titre?.toLowerCase().includes(q) || t.udc_users?.pseudo?.toLowerCase().includes(q);
  });

  async function supprimer(id) {
    setErreur('');
    setSuppressionEnCoursId(id);
    try {
      const res = await fetch(`/api/admin/textes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression.');
      setTextes((prev) => prev.filter((t) => t.id !== id));
      setConfirmationId(null);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setSuppressionEnCoursId(null);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <input
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher par titre ou pseudo..."
        style={{
          width: '100%', padding: '10px 14px', border: '1px solid #DDD2BC', borderRadius: 10,
          fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: 18,
        }}
      />

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>
          {erreur}
        </p>
      )}

      {textesFiltres.length === 0 && (
        <p style={{ color: '#6B6255', textAlign: 'center', marginTop: 30 }}>Aucun texte trouvé.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {textesFiltres.map((t) => {
          const couleur = COULEURS_CATEGORIE[t.categorie] || '#DDD2BC';
          return (
            <div key={t.id} style={{
              background: '#fff', border: '1px solid #DDD2BC', borderLeft: `4px solid ${couleur}`,
              borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: couleur, color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                    padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase',
                  }}>
                    {LABELS_CATEGORIE[t.categorie]}
                  </span>
                  {t.coup_de_coeur && <span title="Coup de cœur">💛</span>}
                </div>
                <Link href={`/textes/${t.id}`} target="_blank" style={{ fontFamily: 'Fraunces, serif', fontSize: '1.02rem', color: '#2B2620', textDecoration: 'none', display: 'block', marginTop: 6 }}>
                  {t.titre}
                </Link>
                <div style={{ fontSize: '0.8rem', color: '#6B6255', marginTop: 4 }}>
                  @{t.udc_users?.pseudo} · {t.date_publication ? new Date(t.date_publication).toLocaleDateString('fr-FR') : ''} · 👁️ {t.vues || 0}
                </div>
              </div>

              {confirmationId === t.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: '#B23A2E', fontWeight: 600 }}>Supprimer définitivement ?</span>
                  <button
                    onClick={() => supprimer(t.id)}
                    disabled={suppressionEnCoursId === t.id}
                    style={{ background: '#B23A2E', color: '#fff', border: 'none', borderRadius: 100, padding: '7px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    {suppressionEnCoursId === t.id ? '...' : 'Oui, supprimer'}
                  </button>
                  <button
                    onClick={() => setConfirmationId(null)}
                    style={{ background: 'none', border: '1px solid #DDD2BC', borderRadius: 100, padding: '7px 14px', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmationId(t.id)}
                  style={{ background: 'none', border: '1px solid #B23A2E', color: '#B23A2E', borderRadius: 100, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', flexShrink: 0 }}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
