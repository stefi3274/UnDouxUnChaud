'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConcoursAdmin() {
  const [concours, setConcours] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [titre, setTitre] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function charger() {
    setChargement(true);
    const res = await fetch('/api/admin/concours');
    const data = await res.json();
    setConcours(data.concours || []);
    setChargement(false);
  }

  useEffect(() => { charger(); }, []);

  async function creer(e) {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      const res = await fetch('/api/admin/concours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, theme, description, date_debut: dateDebut, date_fin: dateFin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur.');
      setTitre(''); setTheme(''); setDescription(''); setDateDebut(''); setDateFin('');
      await charger();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(id, titreConcours) {
    if (!confirm(`Supprimer le concours "${titreConcours}" ? Les textes associés ne seront pas supprimés.`)) return;
    await fetch(`/api/admin/concours/${id}`, { method: 'DELETE' });
    charger();
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #DDD2BC',
    borderRadius: 10, fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: '#6B6255', marginBottom: 8,
  };

  const maintenant = new Date();

  return (
    <div>
      <form onSubmit={creer} style={{ background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 16, padding: 22, marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Titre du concours</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} style={inputStyle} placeholder="Ex. : Concours de la Saint-Valentin" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Thème</label>
          <input value={theme} onChange={(e) => setTheme(e.target.value)} style={inputStyle} placeholder="Ex. : Retrouvailles inattendues" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Date de début</label>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Date de fin</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} style={inputStyle} />
          </div>
        </div>
        {erreur && (
          <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>{erreur}</p>
        )}
        <button type="submit" disabled={envoi} className="btn-primary" style={{ border: 'none' }}>
          {envoi ? 'Création...' : '+ Créer le concours'}
        </button>
      </form>

      {chargement && <p style={{ color: '#6B6255' }}>Chargement...</p>}
      {!chargement && concours.length === 0 && <p style={{ color: '#6B6255' }}>Aucun concours pour l'instant.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {concours.map((c) => {
          const actif = new Date(c.date_debut) <= maintenant && maintenant <= new Date(c.date_fin);
          return (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #DDD2BC', borderRadius: 14, padding: '14px 16px' }}>
              <div>
                <Link href={`/concours/${c.id}`} style={{ fontWeight: 700, color: '#2B2620', textDecoration: 'none' }}>{c.titre}</Link>
                {c.theme && <div style={{ fontSize: '0.82rem', color: '#0A5F63', fontStyle: 'italic', marginTop: 2 }}>Thème : {c.theme}</div>}
                <div style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 2 }}>
                  De {new Date(c.date_debut).toLocaleDateString('fr-FR')} à {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                  {' · '}
                  <span style={{ color: actif ? '#3F8F5C' : '#6B6255', fontWeight: 600 }}>{actif ? 'Actif' : 'Terminé'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => supprimer(c.id, c.titre)}
                style={{ background: 'none', border: 'none', color: '#B23A2E', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Supprimer
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
