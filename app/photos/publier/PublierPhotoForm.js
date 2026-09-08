'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChampSerie from '@/app/components/ChampSerie';

const CATEGORIES = [
  { value: 'un_doux', label: 'Un Doux', color: '#E85D8A' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#3F8F5C' },
  { value: 'piment', label: 'Piment', color: '#E08A1D' },
  { value: 'piquant', label: 'Piquant', color: '#D4321F' },
];

export default function PublierPhotoForm() {
  const router = useRouter();
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('un_doux');
  const [droits, setDroits] = useState(false);
  const [majeur, setMajeur] = useState(false);
  const [estSerie, setEstSerie] = useState(false);
  const [serieTitre, setSerieTitre] = useState('');
  const [chapitreNum, setChapitreNum] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  function choisirFichier(e) {
    const f = e.target.files?.[0];
    setFichier(f || null);
    setApercu(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!fichier) { setErreur('Choisis une image.'); return; }
    if (!droits || !majeur) { setErreur('Les deux confirmations ci-dessous sont obligatoires.'); return; }

    setEnvoi(true);
    try {
      const fd = new FormData();
      fd.append('file', fichier);
      fd.append('titre', titre);
      fd.append('description', description);
      fd.append('categorie', categorie);
      fd.append('consentement_droits', 'true');
      fd.append('consentement_majeur', 'true');
      if (estSerie && serieTitre.trim()) {
        fd.append('serie_titre', serieTitre.trim());
        if (chapitreNum) fd.append('chapitre_numero', chapitreNum);
      }

      const res = await fetch('/api/photos/submit', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error || 'Une erreur est survenue.');
        return;
      }
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
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Photo</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choisirFichier} style={inputStyle} />
        {apercu && (
          <img src={apercu} alt="" style={{ marginTop: 12, width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12 }} />
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Titre <span style={{ textTransform: 'none', fontWeight: 400 }}>(optionnel)</span></label>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Description <span style={{ textTransform: 'none', fontWeight: 400 }}>(optionnelle)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
      </div>

      <div style={{ marginBottom: 24 }}>
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

      <ChampSerie
        type="photo"
        estSerie={estSerie} setEstSerie={setEstSerie}
        serieTitre={serieTitre} setSerieTitre={setSerieTitre}
        chapitreNum={chapitreNum} setChapitreNum={setChapitreNum}
        inputStyle={inputStyle}
      />

      <div style={{ background: '#FBF1DF', border: '1px solid #E8D4A8', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem', cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={droits} onChange={(e) => setDroits(e.target.checked)} style={{ marginTop: 3 }} />
          <span>Je confirme détenir tous les droits sur cette image (photo prise par moi ou dont je suis le sujet), et que toute personne visible a explicitement consenti à sa publication ici.</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={majeur} onChange={(e) => setMajeur(e.target.checked)} style={{ marginTop: 3 }} />
          <span>Je confirme que toutes les personnes visibles sur cette photo, moi y compris, ont 18 ans ou plus.</span>
        </label>
      </div>

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>
          {erreur}
        </p>
      )}

      <button type="submit" disabled={envoi} className="btn-primary" style={{ border: 'none', width: '100%' }}>
        {envoi ? 'Envoi...' : 'Envoyer pour relecture'}
      </button>
    </form>
  );
}
