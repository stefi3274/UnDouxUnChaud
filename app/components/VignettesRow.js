import Link from 'next/link';

const COULEURS_CATEGORIE = {
  un_doux: '#E85D8A',
  un_chaud: '#3F8F5C',
  piment: '#E08A1D',
  piquant: '#D4321F',
  poemes: '#9B5FC0',
  chat_fiction: '#C9A227',
};

export default function VignettesRow({ titre, icone, textes }) {
  if (!textes || textes.length === 0) return null;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto 2vw', padding: '0 6vw' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', marginBottom: 12 }}>
        {icone} {titre}
      </h2>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6 }}>
        {textes.map((t) => {
          const couleur = COULEURS_CATEGORIE[t.categorie] || '#0A5F63';
          return (
            <Link
              key={t.id}
              href={`/textes/${t.id}`}
              style={{
                flex: '0 0 180px', borderRadius: 14, overflow: 'hidden', textDecoration: 'none',
                color: '#fff', position: 'relative', height: 220, display: 'block',
                background: t.imageSignedUrl
                  ? `url(${t.imageSignedUrl}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${couleur}, #181410)`,
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 55%)' }} />
              <span style={{
                position: 'absolute', top: 10, left: 10, background: couleur, color: '#fff',
                fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100,
              }}>
                {t.moyenne ? `★ ${t.moyenne.toFixed(1)}` : '🌟'}
              </span>
              <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>
                {t.titre}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
