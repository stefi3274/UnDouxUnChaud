import { urlImagePub } from '@/lib/ads';

export default function AdBanner({ ads }) {
  if (!ads || ads.length === 0) return null;
  return (
    <div style={{ margin: '0 6vw 2vw', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ads.map((ad) => {
        const image = urlImagePub(ad.image_path);
        return (
          <a
            key={ad.id}
            href={ad.lien}
            target="_blank"
            rel="noopener sponsored"
            style={{
              display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'var(--ink)',
              background: '#fff', border: '1px dashed var(--beige-line)', borderRadius: 14, padding: '12px 16px',
            }}
          >
            {image && (
              <img src={image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Publicité
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{ad.titre}</div>
              {ad.description && (
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 2 }}>{ad.description}</div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
