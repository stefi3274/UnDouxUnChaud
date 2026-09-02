'use client';

import { useEffect, useState } from 'react';

const EMPLACEMENTS = [
  { value: 'fil', label: 'Dans le fil de textes' },
  { value: 'banniere', label: "Bandeau de la page d'accueil" },
];

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [lien, setLien] = useState('');
  const [emplacement, setEmplacement] = useState('fil');
  const [ordre, setOrdre] = useState(0);
  const [fichier, setFichier] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function chargerAds() {
    setChargement(true);
    const res = await fetch('/api/admin/ads');
    const data = await res.json();
    setAds(data.ads || []);
    setChargement(false);
  }

  useEffect(() => { chargerAds(); }, []);

  async function creerPub(e) {
    e.preventDefault();
    setErreur('');
    if (!titre.trim() || !lien.trim()) {
      setErreur('Titre et lien sont requis.');
      return;
    }
    setEnvoi(true);
    try {
      let image_path = null;
      if (fichier) {
        const fd = new FormData();
        fd.append('file', fichier);
        const resUpload = await fetch('/api/admin/ads/upload-image', { method: 'POST', body: fd });
        const dataUpload = await resUpload.json();
        if (!resUpload.ok) throw new Error(dataUpload.error || "Erreur lors de l'envoi de l'image.");
        image_path = dataUpload.path;
      }

      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, description, lien, emplacement, ordre: Number(ordre) || 0, image_path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création.');

      setTitre(''); setDescription(''); setLien(''); setEmplacement('fil'); setOrdre(0); setFichier(null);
      await chargerAds();
    } catch (err) {
      setErreur(err.message);
    }
    setEnvoi(false);
  }

  async function basculerActif(pub) {
    await fetch(`/api/admin/ads/${pub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actif: !pub.actif }),
    });
    chargerAds();
  }

  async function supprimer(pub) {
    if (!confirm(`Supprimer la pub "${pub.titre}" ?`)) return;
    await fetch(`/api/admin/ads/${pub.id}`, { method: 'DELETE' });
    chargerAds();
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
    <div>
      <form onSubmit={creerPub} style={{ background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 16, padding: 22, marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Titre</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} style={inputStyle} placeholder="Nom de l'annonceur ou du produit" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Courte accroche (optionnelle)" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Lien</label>
          <input value={lien} onChange={(e) => setLien(e.target.value)} style={inputStyle} placeholder="https://..." />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Image (optionnelle)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFichier(e.target.files?.[0] || null)} style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Emplacement</label>
            <select value={emplacement} onChange={(e) => setEmplacement(e.target.value)} style={inputStyle}>
              {EMPLACEMENTS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ordre</label>
            <input type="number" value={ordre} onChange={(e) => setOrdre(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {erreur && (
          <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>{erreur}</p>
        )}

        <button type="submit" disabled={envoi} className="btn-primary" style={{ border: 'none' }}>
          {envoi ? 'Création...' : '+ Créer la pub'}
        </button>
      </form>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.2rem', marginBottom: 14 }}>Pubs existantes</h2>

      {chargement && <p style={{ color: '#6B6255' }}>Chargement...</p>}
      {!chargement && ads.length === 0 && <p style={{ color: '#6B6255' }}>Aucune pub pour l'instant.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ads.map((pub) => (
          <div key={pub.id} style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#fff', border: '1px solid #DDD2BC', borderRadius: 14, padding: 14 }}>
            {pub.image_path ? (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pubs-images/${pub.image_path}`}
                alt=""
                style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', background: '#EFE7D8' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 10, background: '#EFE7D8' }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{pub.titre}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B6255' }}>
                {EMPLACEMENTS.find((e) => e.value === pub.emplacement)?.label} · ordre {pub.ordre}
              </div>
            </div>
            <button
              type="button"
              onClick={() => basculerActif(pub)}
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: '0.8rem', color: pub.actif ? '#3F8F5C' : '#6B6255' }}
            >
              {pub.actif ? '● Active' : '○ Inactive'}
            </button>
            <button
              type="button"
              onClick={() => supprimer(pub)}
              style={{ background: 'none', border: 'none', color: '#B23A2E', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
