import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import Link from 'next/link';

async function compter(table, filtre) {
  let requete = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
  if (filtre) requete = filtre(requete);
  const { count } = await requete;
  return count || 0;
}

export default async function AdminStatsPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const ilYA7Jours = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUtilisateurs, nouveauxUtilisateurs,
    totalTextes, textesEnAttente, textesSemaine,
    totalLikes, totalCommentaires,
    totalPhotos, photosEnAttente,
    totalAudios, audiosEnAttente,
    mieuxLus,
  ] = await Promise.all([
    compter('udc_users'),
    compter('udc_users', (q) => q.gt('created_at', ilYA7Jours)),
    compter('udc_textes', (q) => q.eq('statut', 'accepte')),
    compter('udc_textes', (q) => q.eq('statut', 'en_attente')),
    compter('udc_textes', (q) => q.eq('statut', 'accepte').gt('date_publication', ilYA7Jours)),
    compter('udc_likes'),
    compter('udc_commentaires'),
    compter('udc_photos', (q) => q.eq('statut', 'accepte')),
    compter('udc_photos', (q) => q.eq('statut', 'en_attente')),
    compter('udc_audios', (q) => q.eq('statut', 'accepte')),
    compter('udc_audios', (q) => q.eq('statut', 'en_attente')),
    supabaseAdmin.from('udc_textes').select('id, titre, vues').eq('statut', 'accepte').order('vues', { ascending: false }).limit(5),
  ]);

  const carteStyle = {
    background: '#fff', border: '1px solid #DDD2BC', borderRadius: 14, padding: '18px 20px',
  };
  const chiffreStyle = { fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Fraunces, serif' };
  const labelStyle = { fontSize: '0.8rem', color: '#6B6255', marginTop: 4 };

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Statistiques</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginTop: 24 }}>
          <div style={carteStyle}>
            <div style={chiffreStyle}>{totalUtilisateurs}</div>
            <div style={labelStyle}>Comptes créés{nouveauxUtilisateurs > 0 ? ` (+${nouveauxUtilisateurs} cette semaine)` : ''}</div>
          </div>
          <div style={carteStyle}>
            <div style={chiffreStyle}>{totalTextes}</div>
            <div style={labelStyle}>Textes publiés{textesSemaine > 0 ? ` (+${textesSemaine} cette semaine)` : ''}</div>
          </div>
          <div style={carteStyle}>
            <div style={{ ...chiffreStyle, color: textesEnAttente > 0 ? '#B23A2E' : '#2B2620' }}>{textesEnAttente}</div>
            <div style={labelStyle}>Textes en attente</div>
          </div>
          <div style={carteStyle}>
            <div style={chiffreStyle}>{totalLikes}</div>
            <div style={labelStyle}>❤️ au total</div>
          </div>
          <div style={carteStyle}>
            <div style={chiffreStyle}>{totalCommentaires}</div>
            <div style={labelStyle}>💬 au total</div>
          </div>
          <div style={carteStyle}>
            <div style={chiffreStyle}>{totalPhotos}</div>
            <div style={labelStyle}>Photos ({photosEnAttente} en attente)</div>
          </div>
          <div style={carteStyle}>
            <div style={chiffreStyle}>{totalAudios}</div>
            <div style={labelStyle}>Audios ({audiosEnAttente} en attente)</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', marginTop: 36, marginBottom: 14 }}>
          Les plus lus
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(mieuxLus.data || []).map((t, i) => (
            <Link key={t.id} href={`/textes/${t.id}`} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none',
              color: 'inherit', background: '#fff', border: '1px solid #DDD2BC', borderRadius: 10, padding: '10px 16px',
            }}>
              <span>{i + 1}. {t.titre}</span>
              <span style={{ color: '#6B6255', fontSize: '0.85rem' }}>👁️ {t.vues || 0}</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
