export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #DDD2BC', marginTop: 40, padding: '28px 6vw',
      display: 'flex', flexWrap: 'wrap', gap: '10px 24px', alignItems: 'center',
      justifyContent: 'space-between', fontSize: '0.82rem', color: '#6B6255',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
        <a href="/a-propos" style={{ color: '#6B6255', textDecoration: 'none' }}>À propos</a>
        <a href="/contact" style={{ color: '#6B6255', textDecoration: 'none' }}>Contact</a>
        <a href="/mentions-legales" style={{ color: '#6B6255', textDecoration: 'none' }}>Mentions légales</a>
      </div>
      <div>
        Créé par <span style={{ fontWeight: 700, color: '#2B2620' }}>SteFi Services</span>
      </div>
    </footer>
  );
}
