import { notFound } from 'next/navigation';
import { supabasePublic, supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import Link from 'next/link';
import { urlAvatar } from '@/lib/avatar';
import SuivreBouton from './SuivreBouton';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux', un_chaud: 'Un Chaud', piment: 'Piment', piquant: 'Piquant',
  poemes: 'Poèmes et Lettres', chat_fiction: 'Chat Fiction',
};

async function getAuteur(pseudo) {
  const { data } = await supabasePublic
    .from('udc_users')
    .select('id, pseudo, bio, avatar_path, membre_fondateur, created_at')
    .ilike('pseudo', pseudo)
    .maybeSingle();
  return data;
}

export default async function AuteurPage({ params }) {
  const auteur = await getAuteur(decodeURIComponent(params.pseudo));
  if (!auteur) notFound();

  const user = getSessionUser();

  const [{ data: textes }, { count: nbAbonnes }, { data: dejaSuivi }] = await Promise.all([
    supabasePublic
      .from('udc_textes')
      .select('id, titre, contenu, categorie, date_publication')
      .eq('user_id', auteur.id)
      .eq('statut', 'accepte')
      .order('date_publication', { ascending: false }),
    supabaseAdmin.from('udc_follows').select('*', { count: 'exact', head: true }).eq('followed_id', auteur.id),
    user
      ? supabaseAdmin.from('udc_follows').select('id').eq('follower_id', user.id).eq('followed_id', auteur.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const totalLikes = await Promise.all(
    (textes || []).map(async (t) => {
      const { count } = await supabasePublic.from('udc_likes').select('*', { count: 'exact', head: true }).eq('texte_id', t.id);
      return count || 0;
    })
  ).then((counts) => counts.reduce((s, c) => s + c, 0));

  const avatar = urlAvatar(auteur.avatar_path);

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%', border: '2px solid #DDD2BC',
            background: avatar ? `url(${avatar}) center/cover no-repeat` : '#F8F3E8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 700, color: '#0A5F63', flexShrink: 0,
          }}>
            {!avatar && (auteur.pseudo?.[0]?.toUpperCase() || '?')}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Fraunces, serif' }}>@{auteur.pseudo}</h1>
              {auteur.membre_fondateur && (
                <span style={{ background: '#C9A227', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                  🌟 Membre fondateur
                </span>
              )}
            </div>
            <div style={{ color: '#6B6255', fontSize: '0.85rem', marginTop: 4 }}>
              {textes?.length || 0} texte{(textes?.length || 0) > 1 ? 's' : ''} · {nbAbonnes || 0} abonné{(nbAbonnes || 0) > 1 ? 's' : ''} · {totalLikes} ❤️
            </div>
            {user && user.id !== auteur.id && (
              <div style={{ marginTop: 10 }}>
                <SuivreBouton auteurId={auteur.id} initialementSuivi={!!dejaSuivi} />
              </div>
            )}
          </div>
        </div>

        {auteur.bio && (
          <p style={{ marginTop: 20, color: '#2B2620', lineHeight: 1.7, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
            {auteur.bio}
          </p>
        )}

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', marginTop: 32, marginBottom: 14 }}>
          Textes publiés
        </h2>

        {(!textes || textes.length === 0) && (
          <p style={{ color: '#6B6255' }}>Aucun texte publié pour l'instant.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(textes || []).map((t) => (
            <Link key={t.id} href={`/textes/${t.id}`} className={`card card-${t.categorie}`}>
              <span className={`badge ${t.categorie}`}>{LABELS_CATEGORIE[t.categorie]}</span>
              <h3 style={{ marginTop: 10 }}>{t.titre}</h3>
              <p className="card-excerpt">{t.contenu.trim().replace(/\s+/g, ' ').slice(0, 140)}…</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
