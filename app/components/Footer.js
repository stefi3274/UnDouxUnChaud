import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #DDD2BC', marginTop: 40 }}>
    <div style={{
      padding: '28px 6vw', maxWidth: 1280, margin: '0 auto',
      display: 'flex', flexWrap: 'wrap', gap: '10px 24px', alignItems: 'center',
      justifyContent: 'space-between', fontSize: '0.82rem', color: '#6B6255',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
        <Link href="/a-propos" style={{ color: '#6B6255', textDecoration: 'none' }}>À propos</Link>
        <Link href="/contact" style={{ color: '#6B6255', textDecoration: 'none' }}>Contact</Link>
        <Link href="/mentions-legales" style={{ color: '#6B6255', textDecoration: 'none' }}>Mentions légales</Link>
      </div>
      <div>
        Créé par <span style={{ fontWeight: 700, color: '#2B2620' }}>SteFi Services</span>
      </div>
    </div>
    </footer>
  );
}
