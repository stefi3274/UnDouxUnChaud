'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseNavigateur } from '@/lib/supabaseClient';

const CATEGORIES = [
  { value: 'un_doux', label: 'Un Doux', color: '#E85D8A' },
  { value: 'un_chaud', label: 'Un Chaud', color: '#3F8F5C' },
  { value: 'piment', label: 'Piment', color: '#E08A1D' },
  { value: 'piquant', label: 'Piquant', color: '#D4321F' },
  { value: 'poemes', label: 'Poèmes', color: '#9B5FC0' },
];

const TAILLE_MAX = 60 * 1024 * 1024; // 60 Mo
const TYPES_AUTORISES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];

function extensionDe(type) {
  if (type === 'audio/mpeg') return 'mp3';
  if (type === 'audio/mp4' || type === 'audio/x-m4a') return 'm4a';
  if (type === 'audio/wav') return 'wav';
  if (type === 'audio/ogg') return 'ogg';
  return 'mp3';
}

export default function PublierAudioForm() {
  const router = useRouter();
  const [fichier, setFichier] = useState(null);
  const [duree, setDuree] = useState(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('un_doux');
  const [envoi, setEnvoi] = useState(false);
  const [progression, setProgression] = useState('');
  const [erreur, setErreur] = useState('');

  function choisirFichier(e) {
    const f = e.target.files?.[0];
    setErreur('');
    if (!f) { setFichier(null); return; }
    if (!TYPES_AUTORISES.includes(f.type)) {
      setErreur('Format non supporté (MP3, M4A, WAV ou OGG).');
      return;
    }
    if (f.size > TAILLE_MAX) {
      setErreur('Fichier trop lourd (60 Mo maximum).');
      return;
    }
    setFichier(f);
    const audio = new Audio(URL.createObjectURL(f));
    audio.addEventListener('loadedmetadata', () => setDuree(audio.duration));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!fichier) { setErreur('Choisis un fichier audio.'); return; }
    if (!titre.trim()) { setErreur('Le titre est requis.'); return; }

    setEnvoi(true);
    try {
      setProgression("Préparation de l'envoi...");
      const resUrl = await fetch('/api/audio/request-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extension: extensionDe(fichier.type) }),
      });
      const { path, token, error: erreurUrl } = await resUrl.json();
      if (!resUrl.ok) throw new Error(erreurUrl || "Erreur de préparation.");

      setProgression('Envoi du fichier audio...');
      const supabase = getSupabaseNavigateur();
      const { error: erreurEnvoi } = await supabase.storage
        .from('audios-files')
        .uploadToSignedUrl(path, token, fichier);
      if (erreurEnvoi) throw new Error("L'envoi du fichier a échoué.");

      setProgression('Enregistrement...');
      const resSubmit = await fetch('/api/audio/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, description, categorie, audio_path: path, duree_secondes: duree }),
      });
      const dataSubmit = await resSubmit.json();
      if (!resSubmit.ok) throw new Error(dataSubmit.error || "Erreur d'enregistrement.");

      router.push('/audio');
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue.');
    } finally {
      setEnvoi(false);
      setProgression('');
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
        <label style={labelStyle}>Fichier audio (MP3, M4A, WAV, OGG — 60 Mo max)</label>
        <input type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/x-m4a" onChange={choisirFichier} style={inputStyle} />
        {fichier && (
          <audio controls src={URL.createObjectURL(fichier)} style={{ width: '100%', marginTop: 12 }} />
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Titre</label>
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

      {erreur && (
        <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>
          {erreur}
        </p>
      )}

      <button type="submit" disabled={envoi} className="btn-primary" style={{ border: 'none', width: '100%' }}>
        {envoi ? (progression || 'Envoi...') : 'Envoyer pour relecture'}
      </button>
    </form>
  );
}
