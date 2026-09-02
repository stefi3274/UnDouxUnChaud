'use client';

import { useEffect, useRef, useState } from 'react';

const CATEGORIES = {
  un_doux: { label: 'Un Doux', color: '#D98CA0' },
  un_chaud: { label: 'Un Chaud', color: '#6F8F6B' },
  piment: { label: 'Piment', color: '#CE8B33' },
  piquant: { label: 'Piquant', color: '#B23A2E' },
  poemes: { label: 'Poèmes', color: '#8A7CA8' },
};

const SIZE = 1080;
const MARGE = 90;

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitExtrait(ctx, text, maxWidth, maxLines) {
  let fontSize = 58;
  const minFontSize = 30;
  let lines = [];
  let lineHeight = 0;
  while (fontSize >= minFontSize) {
    ctx.font = `italic 500 ${fontSize}px Fraunces, serif`;
    lines = wrapLines(ctx, text, maxWidth);
    lineHeight = Math.round(fontSize * 1.32);
    if (lines.length <= maxLines) break;
    fontSize -= 2;
  }
  return { fontSize, lines, lineHeight };
}

// Dessine du texte avec un espacement de lettres manuel (compatible partout).
function fillTextSpaced(ctx, text, x, y, spacing, align = 'left') {
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + spacing;
  total -= spacing;
  let cx = x;
  if (align === 'center') cx = x - total / 2;
  else if (align === 'right') cx = x - total;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = prevAlign;
  return total;
}

function drawCover(ctx, img, size) {
  const ratio = Math.max(size / img.width, size / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
}

function chargerImage(url) {
  return new Promise((resolve) => {
    if (!url) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function extraitParDefaut(contenu) {
  const propre = (contenu || '').replace(/\s+/g, ' ').trim();
  if (propre.length <= 220) return propre;
  const coupe = propre.slice(0, 220);
  const dernierEspace = coupe.lastIndexOf(' ');
  return `${coupe.slice(0, dernierEspace > 0 ? dernierEspace : 220)}…`;
}

export default function PostGenerator({ textes }) {
  const canvasRef = useRef(null);
  const [texteId, setTexteId] = useState('');
  const [extrait, setExtrait] = useState('');
  const [auteur, setAuteur] = useState('');
  const [categorie, setCategorie] = useState('un_doux');
  const [imageUrl, setImageUrl] = useState(null);
  const [pretAExporter, setPretAExporter] = useState(false);
  const [erreurExport, setErreurExport] = useState('');
  const [chargementImage, setChargementImage] = useState(false);

  async function choisirTexte(id) {
    setTexteId(id);
    const t = textes.find((x) => String(x.id) === String(id));
    if (!t) return;
    setExtrait(extraitParDefaut(t.contenu));
    setAuteur(t.udc_users?.pseudo || '');
    setCategorie(t.categorie);
    setImageUrl(null);

    if (t.image_url) {
      setChargementImage(true);
      try {
        const res = await fetch(`/api/admin/post-image?id=${t.id}`);
        const data = await res.json();
        setImageUrl(data.dataUrl || null);
      } catch {
        setImageUrl(null);
      }
      setChargementImage(false);
    }
  }

  useEffect(() => {
    let annule = false;
    async function dessiner() {
      setPretAExporter(false);
      if (document.fonts?.ready) {
        try { await document.fonts.ready; } catch {}
      }
      const img = await chargerImage(imageUrl);
      if (annule) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const cat = CATEGORIES[categorie] || CATEGORIES.un_doux;

      // Fond : image du texte, sinon dégradé sombre teinté catégorie
      if (img) {
        drawCover(ctx, img, SIZE);
      } else {
        const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        grad.addColorStop(0, hexToRgba(cat.color, 0.9));
        grad.addColorStop(1, '#181410');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, SIZE, SIZE);
      }

      // Voile sombre uniforme (lisibilité du texte sur toute image)
      ctx.fillStyle = 'rgba(12, 10, 8, 0.30)';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Dégradé renforcé en bas pour la citation
      const vignette = ctx.createLinearGradient(0, 460, 0, SIZE);
      vignette.addColorStop(0, 'rgba(10, 8, 6, 0)');
      vignette.addColorStop(0.55, 'rgba(10, 8, 6, 0.55)');
      vignette.addColorStop(1, 'rgba(8, 6, 5, 0.90)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 460, SIZE, SIZE - 460);

      // Liseré catégorie en haut
      ctx.fillStyle = cat.color;
      ctx.fillRect(0, 0, SIZE, 6);

      // Étiquette catégorie (point + texte espacé)
      ctx.beginPath();
      ctx.arc(MARGE + 5, 97, 5, 0, Math.PI * 2);
      ctx.fillStyle = cat.color;
      ctx.fill();
      ctx.font = '600 15px "Public Sans", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.textBaseline = 'middle';
      fillTextSpaced(ctx, cat.label.toUpperCase(), MARGE + 20, 98, 3, 'left');

      // Logo, en haut à droite, discret
      ctx.font = 'italic 600 26px Fraunces, serif';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('UnDouxUnChaud', SIZE - MARGE, 98);
      ctx.textAlign = 'left';

      // Citation, alignée à gauche, ancrée en bas du bloc
      const maxWidth = SIZE - MARGE * 2 - 20;
      const texteExtrait = extrait?.trim() ? extrait.trim() : 'Sélectionne un texte pour voir l\u2019extrait ici.';
      const { fontSize, lines, lineHeight } = fitExtrait(ctx, texteExtrait, maxWidth, 6);
      ctx.font = `italic 500 ${fontSize}px Fraunces, serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'alphabetic';
      const baseAncrage = 758;
      let y = baseAncrage - (lines.length - 1) * lineHeight;
      for (const ligne of lines) {
        ctx.fillText(ligne, MARGE, y);
        y += lineHeight;
      }

      // Trait fin + auteur
      const traitY = baseAncrage + 42;
      ctx.strokeStyle = cat.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(MARGE, traitY);
      ctx.lineTo(MARGE + 56, traitY);
      ctx.stroke();

      ctx.font = '600 15px "Public Sans", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.textBaseline = 'alphabetic';
      fillTextSpaced(ctx, `@${(auteur || 'auteur·rice').toUpperCase()}`, MARGE, traitY + 30, 2, 'left');

      // Séparateur + invitation à lire plus, en bas
      const sepY = 950;
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGE, sepY);
      ctx.lineTo(SIZE - MARGE, sepY);
      ctx.stroke();

      ctx.font = '600 13px "Public Sans", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      ctx.textBaseline = 'alphabetic';
      fillTextSpaced(ctx, 'LIRE LE TEXTE COMPLET', MARGE, sepY + 34, 2.4, 'left');

      ctx.fillStyle = cat.color;
      fillTextSpaced(ctx, 'UNDOUXUNCHAUD.COM →', SIZE - MARGE, sepY + 34, 2.4, 'right');

      setPretAExporter(true);
    }
    dessiner();
    return () => { annule = true; };
  }, [extrait, auteur, categorie, imageUrl]);

  function telecharger() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setErreurExport('');
    try {
      const lien = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      lien.download = `post-${categorie}-${date}.png`;
      lien.href = canvas.toDataURL('image/png', 1.0);
      lien.click();
    } catch {
      setErreurExport("Le téléchargement a échoué à cause de l'image de fond (restriction de sécurité du navigateur). Réessaie, ou fais une capture d'écran de l'aperçu en attendant.");
    }
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
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 380px', gap: 32, alignItems: 'start' }}>
      <div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Texte publié</label>
          <select value={texteId} onChange={(e) => choisirTexte(e.target.value)} style={inputStyle}>
            <option value="">— Choisir un texte —</option>
            {textes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titre} — @{t.udc_users?.pseudo} ({CATEGORIES[t.categorie]?.label}){!t.image_url ? ' · sans image' : ''}
              </option>
            ))}
          </select>
          {textes.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: '#6B6255', marginTop: 6 }}>
              Aucun texte publié pour l'instant.
            </p>
          )}
          {texteId && !imageUrl && !chargementImage && !textes.find((x) => String(x.id) === String(texteId))?.image_url && (
            <p style={{ fontSize: '0.8rem', color: '#B23A2E', marginTop: 6 }}>
              Ce texte n'a pas d'image : un dégradé de secours sera utilisé en fond.
            </p>
          )}
          {chargementImage && (
            <p style={{ fontSize: '0.8rem', color: '#6B6255', marginTop: 6 }}>
              Chargement de l'image...
            </p>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Extrait affiché sur le visuel</label>
          <textarea
            value={extrait}
            onChange={(e) => setExtrait(e.target.value)}
            style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Colle ou ajuste l'extrait à mettre en avant..."
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Auteur·rice (pseudo)</label>
          <input
            value={auteur}
            onChange={(e) => setAuteur(e.target.value)}
            style={inputStyle}
            placeholder="pseudo"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Catégorie</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(CATEGORIES).map(([value, c]) => (
              <button
                type="button"
                key={value}
                onClick={() => setCategorie(value)}
                style={{
                  padding: '9px 16px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 600,
                  border: `1px solid ${categorie === value ? c.color : '#DDD2BC'}`,
                  background: categorie === value ? c.color : '#fff',
                  color: categorie === value ? '#fff' : '#2B2620', cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {erreurExport && (
          <p style={{ background: '#FBE7E4', color: '#B23A2E', padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: '0.85rem' }}>
            {erreurExport}
          </p>
        )}

        <button
          type="button"
          onClick={telecharger}
          disabled={!pretAExporter}
          style={{
            background: '#2B2620', color: '#EFE7D8', padding: '13px 24px', borderRadius: 100,
            fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%',
          }}
        >
          ⬇️ Télécharger le visuel (1080×1080)
        </button>
        <p style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 10 }}>
          Format carré, prêt pour X, Facebook et Instagram.
        </p>
      </div>

      <div>
        <label style={labelStyle}>Aperçu</label>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{
            width: '100%', maxWidth: 380, aspectRatio: '1 / 1', borderRadius: 16,
            border: '1px solid #DDD2BC', display: 'block', background: '#181410',
          }}
        />
      </div>
    </div>
  );
}
