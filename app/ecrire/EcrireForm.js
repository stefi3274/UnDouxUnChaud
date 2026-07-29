'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'un_doux', label: 'Un Doux', color: '#D98CA0' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#6F8F6B' },
  { value: 'piment', label: 'Piment', color: '#CE8B33' },
  { value: 'piquant', label: 'Piquant', color: '#B23A2E' },
  { value: 'poemes', label: 'Poèmes', color: '#8A7CA8' },
];

function TagInput({ tags, setTags, placeholder }) {
  const [value, setValue] = useState('');

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && value.trim()) {
      e.preventDefault();
      setTags([...tags, value.trim().replace(/,/g, '')]);
      setValue('');
    }
  }

  return (
    <div style={{ border: '1px solid #DDD2BC', borderRadius: 10, padding: 8, background: '#fff' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: tags.length ? 6 : 0 }}>
        {tags.map((t, i) => (
          <span key={i} style={{
            background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 100,
            padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t}
            <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
          </span>
        ))}
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={addTag}
        placeholder={placeholder}
        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
      />
    </div>
  );
}

export default function EcrireForm() {
  const router = useRouter();
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('un_doux');
  const [isSeries, setIsSeries] = useState(false);
  const [serieTitre, setSerieTitre] = useState('');
  const [chapitreNum, setChapitreNum] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contenu, setContenu] = useState('');
  const [avertissements, setAvertissements] = useState([]);
  const [orientHH, setOrientHH] = useState(false);
  const [orientFF, setOrientFF] = useState(false);
  const [tags, setTags] = useState([]);
  const [consentement, setConsentement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const wordCount = contenu.trim() ? contenu.trim().split(/\s+/).length : 0;
  const estPoeme = categorie === 'poemes';
  const sousMinimumPoeme = estPoeme && wordCount < 100;

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!consentement) {
      setErreur('La certification de consentement est obligatoire.');
      return;
    }
    if (sousMinimumPoeme) {
      setErreur('Un poème doit faire au moins 100 mots.');
      return;
    }

    setChargement(true);
    const res = await fetch('/api/textes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titre, contenu, categorie,
        orientation_hh: orientHH, orientation_ff: orientFF,
        tags, avertissements,
        image_url: imageUrl || null,
        serie_titre: isSeries ? serieTitre : null,
        chapitre_numero: isSeries && chapitreNum ? parseInt(chapitreNum, 10) : null,
        consentement_certifie: consentement,
      }),
    });
    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.error || 'Une erreur est survenue.');
      return;
    }

    router.push('/profil');
    router.refresh();
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #DDD2BC',
    borderRadius: 10, fontSize: '0.9rem', background: '#fff',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: '#6B6255', marginBottom: 8,
  };

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif' }}>Écrire un texte</h1>
      <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 24 }}>
        Ton texte sera relu avant publication, réponse sous 72h à une semaine.
      </p>

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 18 }}>
          {erreur}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Titre</label>
          <input style={inputStyle} value={titre} onChange={(e) => setTitre(e.target.value)} required />
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

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={isSeries} onChange={(e) => setIsSeries(e.target.checked)} />
            Ce texte fait partie d'une série
          </label>
          {isSeries && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginTop: 12 }}>
              <input style={inputStyle} placeholder="Titre de la série" value={serieTitre} onChange={(e) => setSerieTitre(e.target.value)} />
              <input style={inputStyle} placeholder="Chapitre n°" value={chapitreNum} onChange={(e) => setChapitreNum(e.target.value)} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Image d'illustration (URL, optionnelle)</label>
          <input style={inputStyle} placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <p style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 6 }}>
            Upload direct pas encore branché (Supabase Storage à venir) — colle une URL d'image hébergée pour l'instant.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Ton texte</label>
          <textarea
            style={{ ...inputStyle, minHeight: 220, resize: 'vertical', lineHeight: 1.6 }}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            required
          />
          <p style={{ fontSize: '0.78rem', color: sousMinimumPoeme ? '#B23A2E' : '#6B6255', marginTop: 6, fontWeight: sousMinimumPoeme ? 700 : 400 }}>
            {estPoeme
              ? `${wordCount} / 100 mots minimum${sousMinimumPoeme ? ' — pas encore atteint' : ''}`
              : `${wordCount} mot${wordCount > 1 ? 's' : ''} (minimum recommandé : 500)`}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Avertissement de contenu (thèmes sensibles)</label>
          <TagInput tags={avertissements} setTags={setAvertissements} placeholder="Ajoute un thème et appuie sur Entrée" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Orientation (si applicable)</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setOrientHH(!orientHH)} style={{
              padding: '9px 16px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 600,
              border: '1px solid #0E7C81', background: orientHH ? '#0E7C81' : '#fff',
              color: orientHH ? '#fff' : '#0E7C81', cursor: 'pointer',
            }}>HH</button>
            <button type="button" onClick={() => setOrientFF(!orientFF)} style={{
              padding: '9px 16px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 600,
              border: '1px solid #0E7C81', background: orientFF ? '#0E7C81' : '#fff',
              color: orientFF ? '#fff' : '#0E7C81', cursor: 'pointer',
            }}>FF</button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Tags</label>
          <TagInput tags={tags} setTags={setTags} placeholder="Ajoute un tag et appuie sur Entrée" />
        </div>

        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', background: '#F8F3E8',
          border: '1px solid #DDD2BC', borderRadius: 12, padding: '14px 16px', marginBottom: 20,
        }}>
          <input type="checkbox" checked={consentement} onChange={(e) => setConsentement(e.target.checked)} style={{ marginTop: 3 }} required />
          <label style={{ fontSize: '0.88rem' }}>
            Je certifie que ce texte décrit uniquement des pratiques consensuelles entre adultes.
          </label>
        </div>

        <button type="submit" disabled={chargement || sousMinimumPoeme} style={{
          background: '#2B2620', color: '#EFE7D8', padding: '13px 24px', borderRadius: 100,
          fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%',
        }}>
          {chargement ? 'Envoi...' : 'Soumettre pour relecture'}
        </button>
      </form>
    </main>
  );
}
