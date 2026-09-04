'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'un_doux', label: 'Un Doux', color: '#E85D8A' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#3F8F5C' },
  { value: 'piment', label: 'Piment', color: '#E08A1D' },
  { value: 'piquant', label: 'Piquant', color: '#D4321F' },
];

export default function AjouterPhotoAdmin() {
  const router = useRouter();
  const [fichier, setFichier] = useState(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('un_doux');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!fichier) { setErreur('Choisis une image.'); return; }

    setEnvoi(true);
    try {
      const fd = new FormData();
      fd.append('file', fichier);
      fd.append('titre', titre);
      fd.append('description', description);
      fd.append('categorie', categorie);
      fd.append('consentement_droits', 'true');
      fd.append('consentement_majeur', 'true');
      fd.append('publier_direct', 'true');

      const res = await fetch('/api/photos/submit', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setErreur(data.error || 'Une erreur est survenue.'); return; }

      setFichier(null);
      setTitre('');
      setDescription('');
      router.push('/galerie');
    } catch {
      setErreur('Impossible de contacter le serveur. Vérifie ta connexion et réessaie.');
    } finally {
      setEnvoi(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #DDD2BC',
    borderRadius: 10, fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: '#6B6255', marginBottom: 8,
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 16, padding: 22 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Image</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFichier(e.target.files?.[0] || null)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Titre</label>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Catégorie</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => setCategorie(c.value)}
              style={{
                padding: '9px 16px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 600,
                border: `1px solid ${categorie === c.value ? c.color : '#DDD2BC'}`,
                background: categorie === c.value ? c.color : '#fff',
                color: categorie === c.value ? '#fff' : '#2B2620', cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>
          {erreur}
        </p>
      )}
      <button type="submit" disabled={envoi} className="btn-primary" style={{ border: 'none' }}>
        {envoi ? 'Publication...' : '+ Publier dans la galerie'}
      </button>
    </form>
  );
}
