import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';

export default function ContactPage() {
  const user = getSessionUser();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '6vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Contact</h1>
        <p style={{ color: '#6B6255', marginTop: 12, lineHeight: 1.7 }}>
          Une question, une suggestion, un texte à proposer autrement, ou un problème
          à signaler ? Écris-nous directement.
        </p>

        <a
          href="mailto:jecrisdestexteserotiques@gmail.com"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24,
            background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 14,
            padding: '16px 22px', textDecoration: 'none', color: '#0A5F63',
            fontWeight: 700, fontSize: '1rem',
          }}
        >
          ✉️ jecrisdestexteserotiques@gmail.com
        </a>

        <p style={{ color: '#6B6255', marginTop: 20, fontSize: '0.85rem' }}>
          On répond généralement sous quelques jours.
        </p>
      </main>
    </>
  );
}
