'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { urlAvatar } from '@/lib/avatar';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
  poemes: 'Poèmes et Lettres',
};
const COULEURS_CATEGORIE = {
  un_doux: '#E85D8A',
  un_chaud: '#3F8F5C',
  piment: '#E08A1D',
  piquant: '#D4321F',
  poemes: '#9B5FC0',
};

function urgence(dateSoumission) {
  const jours = (Date.now() - new Date(dateSoumission).getTime()) / (1000 * 60 * 60 * 24);
  if (jours >= 6) return { label: `⏱️ ${Math.floor(jours)} j — urgent`, bg: '#FBE7E4', color: '#B23A2E' };
  if (jours >= 3) return { label: `⏱️ ${Math.floor(jours)} j`, bg: '#FBF1DF', color: '#8A6412' };
  return { label: jours < 1 ? "⏱️ Aujourd'hui" : `⏱️ ${Math.floor(jours)} j`, bg: '#E3F1EF', color: '#0A5F63' };
}

export default function AdminQueue({ textes }) {
  const router = useRouter();
  const [refuseOpenId, setRefuseOpenId] = useState(null);
  const [raison, setRaison] = useState('');
  const [chargement, setChargement] = useState(null);

  async function accepter(id) {
    setChargement(id);
    await fetch('/api/admin/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte_id: id }),
    });
    setChargement(null);
    router.refresh();
  }

  async function refuser(id) {
    if (!raison.trim()) return;
    setChargement(id);
    await fetch('/api/admin/refuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte_id: id, raison }),
    });
    setChargement(null);
    setRefuseOpenId(null);
    setRaison('');
    router.refresh();
  }

  if (textes.length === 0) {
    return (
      <div style={{
        marginTop: 24, textAlign: 'center', padding: '48px 24px', background: '#F8F3E8',
        border: '1px dashed #DDD2BC', borderRadius: 16, color: '#6B6255',
      }}>
        <div style={{ fontSize: '2rem' }}>✨</div>
        <p style={{ marginTop: 8 }}>File d'attente vide, tout est à jour.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {textes.map((t) => {
        const couleur = COULEURS_CATEGORIE[t.categorie] || '#DDD2BC';
        const u = urgence(t.date_soumission);
        const avatar = urlAvatar(t.udc_users?.avatar_path);
        return (
          <div key={t.id} style={{
            background: '#fff', border: '1px solid #DDD2BC', borderLeft: `4px solid ${couleur}`,
            borderRadius: 16, padding: 22, boxShadow: '0 2px 10px rgba(43,38,32,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              {t.image_signed_url && (
                <img src={t.image_signed_url} alt="" style={{
                  width: 88, height: 88, objectFit: 'cover', borderRadius: 12, flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(43,38,32,0.12)',
                }} />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: couleur, color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                    padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.03em',
                  }}>
                    {LABELS_CATEGORIE[t.categorie]}
                  </span>
                  <span style={{ background: u.bg, color: u.color, fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>
                    {u.label}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Fraunces, serif', marginTop: 10, fontSize: '1.1rem' }}>{t.titre}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#6B6255', marginTop: 6 }}>
                  {avatar ? (
                    <img src={avatar} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%', background: '#F8F3E8', color: '#0A5F63',
                      fontSize: '0.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {t.udc_users?.pseudo?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                  @{t.udc_users?.pseudo} · {new Date(t.date_soumission).toLocaleDateString('fr-FR')}
                </div>
                {(t.tags?.length > 0 || t.orientation_hh || t.orientation_ff) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {t.orientation_hh && <span style={chipStyle}>HH</span>}
                    {t.orientation_ff && <span style={chipStyle}>FF</span>}
                    {t.tags?.map((tag) => <span key={tag} style={chipStyle}>{tag}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => accepter(t.id)}
                  disabled={chargement === t.id}
                  style={{
                    background: '#0E7C81', color: '#fff', border: 'none', borderRadius: 100, padding: '9px 20px',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 2px 8px rgba(14,124,129,0.25)',
                  }}
                >
                  ✓ Accepter
                </button>
                <button
                  onClick={() => {
                    const nouveau = refuseOpenId === t.id ? null : t.id;
                    setRefuseOpenId(nouveau);
                    setRaison('');
                  }}
                  style={{ background: 'none', border: '1px solid #B23A2E', color: '#B23A2E', borderRadius: 100, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
                >
                  ✕ Refuser
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#6B6255', marginTop: 16, lineHeight: 1.6, fontFamily: 'Fraunces, serif' }}>
              {t.contenu.slice(0, 220)}...
            </p>

            {refuseOpenId === t.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #DDD2BC' }}>
                <textarea
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  placeholder="Raison du refus..."
                  style={{ width: '100%', minHeight: 70, padding: 10, border: '1px solid #DDD2BC', borderRadius: 10 }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => refuser(t.id)}
                    disabled={chargement === t.id}
                    style={{ background: '#B23A2E', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Confirmer le refus
                  </button>
                  <button
                    onClick={() => { setRefuseOpenId(null); setRaison(''); }}
                    style={{ background: 'none', border: '1px solid #DDD2BC', borderRadius: 100, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const chipStyle = {
  background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 100,
  padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#6B6255',
};
