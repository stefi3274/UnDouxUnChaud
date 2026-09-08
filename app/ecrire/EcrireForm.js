'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChampSerie from '@/app/components/ChampSerie';

const CATEGORIES = [
  { value: 'un_doux', label: 'Un Doux', color: '#E85D8A' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#3F8F5C' },
  { value: 'piment', label: 'Piment', color: '#E08A1D' },
  { value: 'piquant', label: 'Piquant', color: '#D4321F' },
  { value: 'poemes', label: 'Poèmes et Lettres', color: '#9B5FC0' },
  { value: 'chat_fiction', label: 'Chat Fiction', color: '#C9A227' },
];

const LANGUES = [
  { value: 'fr', label: 'FR' },
  { value: 'ht', label: 'HT' },
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
  const [langue, setLangue] = useState('fr');
  const [isSeries, setIsSeries] = useState(false);
  const [serieTitre, setSerieTitre] = useState('');
  const [chapitreNum, setChapitreNum] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCredit, setImageCredit] = useState('');
  const [uploadEnCours, setUploadEnCours] = useState(false);
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

  async function handleFile(file) {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploadEnCours(true);
    setErreur('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploadEnCours(false);

    if (!res.ok) {
      setErreur(data.error || "Erreur lors de l'envoi de l'image.");
      setImagePreview(null);
      return;
    }
    setImageUrl(data.path);
  }

  function removeImage() {
    setImageUrl('');
    setImagePreview(null);
    setImageCredit('');
  }

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
        titre, contenu, categorie, langue,
        orientation_hh: orientHH, orientation_ff: orientFF,
        tags, avertissements,
        image_url: imageUrl || null,
        image_credit: imageUrl ? (imageCredit || null) : null,
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
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 24,
        background: '#E3F1EF', color: '#0A5F63', padding: '8px 16px', borderRadius: 100,
        fontSize: '0.82rem', fontWeight: 600,
      }}>
        ⏱️ Relu et publié sous 72h à 1 semaine
      </div>

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
          <label style={labelStyle}>Langue d'écriture</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {LANGUES.map((l) => (
              <button
                type="button"
                key={l.value}
                onClick={() => setLangue(l.value)}
                style={{
                  padding: '9px 20px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700,
                  border: `1px solid ${langue === l.value ? '#0A5F63' : '#DDD2BC'}`,
                  background: langue === l.value ? '#0A5F63' : '#fff',
                  color: langue === l.value ? '#fff' : '#2B2620', cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
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

        <ChampSerie
          type="texte"
          estSerie={isSeries} setEstSerie={setIsSeries}
          serieTitre={serieTitre} setSerieTitre={setSerieTitre}
          chapitreNum={chapitreNum} setChapitreNum={setChapitreNum}
          inputStyle={inputStyle}
        />

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Image d'illustration (optionnelle)</label>
          {imagePreview ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
              <img src={imagePreview} alt="Aperçu" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
              {uploadEnCours && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(43,38,32,0.5)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
                }}>
                  Envoi en cours...
                </div>
              )}
              {!uploadEnCours && (
                <button type="button" onClick={removeImage} style={{
                  position: 'absolute', top: 10, right: 10, background: 'rgba(43,38,32,0.75)',
                  color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer',
                }}>✕</button>
              )}
            </div>
          ) : (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '32px 16px', border: '1.5px dashed #DDD2BC', borderRadius: 14,
              background: '#fff', cursor: 'pointer', color: '#6B6255', fontSize: '0.85rem',
            }}>
              <span style={{ fontSize: '1.6rem', color: '#0E7C81' }}>＋</span>
              Clique ou dépose une image depuis ton appareil
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFile(e.target.files[0])}
                hidden
              />
            </label>
          )}
          <p style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 6 }}>
            JPG, PNG ou WEBP, 5 Mo maximum. Reste suggestive plutôt qu'explicite, vérifiée avant acceptation.
          </p>

          {imagePreview && (
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Crédit de l'image <span style={{ textTransform: 'none', fontWeight: 400 }}>(optionnel)</span></label>
              <input
                style={inputStyle}
                placeholder="Ex : Photo de toi-même, ou @pseudo / nom du site source"
                value={imageCredit}
                onChange={(e) => setImageCredit(e.target.value)}
              />
            </div>
          )}
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

        <button type="submit" disabled={chargement || sousMinimumPoeme || uploadEnCours} style={{
          background: '#2B2620', color: '#EFE7D8', padding: '13px 24px', borderRadius: 100,
          fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%',
        }}>
          {chargement ? 'Envoi...' : 'Soumettre pour relecture'}
        </button>
      </form>
    </main>
  );
}
