import { urlImagePub } from '@/lib/ads';

export default function AdCard({ ad }) {
  const image = urlImagePub(ad.image_path);
  return (
    <a
      href={ad.lien}
      target="_blank"
      rel="noopener sponsored"
      className="card"
      style={{ borderStyle: 'dashed' }}
    >
      <span
        className="badge"
        style={{ background: 'transparent', border: '1px solid var(--beige-line)', color: 'var(--ink-soft)' }}
      >
        Publicité
      </span>
      {image && (
        <img
          src={image}
          alt=""
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginTop: 10 }}
        />
      )}
      <h3 style={{ marginTop: 10 }}>{ad.titre}</h3>
      {ad.description && <p className="card-excerpt">{ad.description}</p>}
    </a>
  );
}
