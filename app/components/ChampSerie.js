'use client';

import { useEffect, useState } from 'react';

export default function ChampSerie({
  type, estSerie, setEstSerie, serieTitre, setSerieTitre, chapitreNum, setChapitreNum,
  inputStyle,
}) {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!estSerie) return;
    fetch(`/api/series?type=${type}`)
      .then((r) => r.json())
      .then((d) => setSeries(d.series || []))
      .catch(() => {});
  }, [estSerie, type]);

  function choisirTitre(valeur) {
    setSerieTitre(valeur);
    const existante = series.find((s) => s.titre === valeur);
    if (existante) setChapitreNum(String(existante.prochainChapitre));
  }

  const datalistId = `series-existantes-${type}`;

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
        <input type="checkbox" checked={estSerie} onChange={(e) => setEstSerie(e.target.checked)} />
        📚 Fait partie d'une série
      </label>

      {estSerie && (
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <div style={{ flex: 2 }}>
            <input
              list={datalistId}
              style={inputStyle}
              placeholder="Titre de la série"
              value={serieTitre}
              onChange={(e) => choisirTitre(e.target.value)}
            />
            <datalist id={datalistId}>
              {series.map((s) => <option key={s.titre} value={s.titre} />)}
            </datalist>
            {series.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#6B6255', marginTop: 4 }}>
                Tape ou choisis une série existante — le numéro de chapitre se remplit tout seul.
              </p>
            )}
          </div>
          <input
            type="number"
            min="1"
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Chapitre n°"
            value={chapitreNum}
            onChange={(e) => setChapitreNum(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
