import { supabasePublic } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import Link from 'next/link';

export default async function ConcoursListePage() {
  const user = getSessionUser();
  const { data: concours } = await supabasePublic.from('udc_concours').select('*').order('date_debut', { ascending: false });
  const maintenant = new Date();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Concours</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 24 }}>
          Soumets un texte, partage-le, et grimpe dans les classements.
        </p>

        {(!concours || concours.length === 0) && <p style={{ color: '#6B6255' }}>Aucun concours pour l'instant.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(concours || []).map((c) => {
            const actif = new Date(c.date_debut) <= maintenant && maintenant <= new Date(c.date_fin);
            return (
              <Link
                key={c.id}
                href={`/concours/${c.id}`}
                style={{
                  display: 'block', background: '#fff', border: '1px solid #DDD2BC', borderRadius: 16,
                  padding: '18px 20px', textDecoration: 'none', color: 'inherit',
                }}
              >
                <span style={{
                  display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                  borderRadius: 100, marginBottom: 8,
                  background: actif ? '#3F8F5C' : '#DDD2BC', color: actif ? '#fff' : '#6B6255',
                }}>
                  {actif ? '🔥 En cours' : 'Terminé'}
                </span>
                <h3 style={{ fontFamily: 'Fraunces, serif' }}>{c.titre}</h3>
                {c.theme && <div style={{ color: '#0A5F63', fontWeight: 700, fontSize: '0.85rem', marginTop: 2 }}>Thème : {c.theme}</div>}
                {c.description && <p style={{ color: '#6B6255', fontSize: '0.88rem', marginTop: 4 }}>{c.description}</p>}
                <div style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 8 }}>
                  {new Date(c.date_debut).toLocaleDateString('fr-FR')} → {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
