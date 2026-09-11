import { supabasePublic } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import Link from 'next/link';
import { urlAvatar } from '@/lib/avatar';

async function getClassement() {
  const { data: textes } = await supabasePublic
    .from('udc_textes')
    .select('id, user_id, udc_users(pseudo, avatar_path, membre_fondateur)')
    .eq('statut', 'accepte');

  if (!textes || textes.length === 0) return [];

  const ids = textes.map((t) => t.id);
  const { data: likes } = await supabasePublic.from('udc_likes').select('texte_id').in('texte_id', ids);

  const likesParTexte = {};
  for (const l of likes || []) likesParTexte[l.texte_id] = (likesParTexte[l.texte_id] || 0) + 1;

  const parAuteur = {};
  for (const t of textes) {
    const id = t.user_id;
    if (!parAuteur[id]) {
      parAuteur[id] = { userId: id, pseudo: t.udc_users?.pseudo, avatar_path: t.udc_users?.avatar_path, membre_fondateur: t.udc_users?.membre_fondateur, textes: 0, likes: 0 };
    }
    parAuteur[id].textes += 1;
    parAuteur[id].likes += likesParTexte[t.id] || 0;
  }

  return Object.values(parAuteur)
    .filter((a) => a.pseudo)
    .sort((a, b) => b.likes - a.likes || b.textes - a.textes)
    .slice(0, 30);
}

export default async function ClassementPage() {
  const user = getSessionUser();
  const classement = await getClassement();

  const medailles = ['🥇', '🥈', '🥉'];

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 620, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Classement des plumes</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 24 }}>
          Les auteur·rice·s les plus aimé·e·s de la communauté.
        </p>

        {classement.length === 0 && <p style={{ color: '#6B6255' }}>Pas encore assez de textes publiés.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {classement.map((a, i) => {
            const avatar = urlAvatar(a.avatar_path);
            return (
              <Link
                key={a.userId}
                href={`/auteur/${encodeURIComponent(a.pseudo)}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit',
                  background: '#fff', border: '1px solid #DDD2BC', borderRadius: 14, padding: '12px 16px',
                }}
              >
                <div style={{ width: 28, textAlign: 'center', fontWeight: 700, color: '#6B6255' }}>
                  {medailles[i] || i + 1}
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: avatar ? `url(${avatar}) center/cover no-repeat` : '#F8F3E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A5F63',
                }}>
                  {!avatar && a.pseudo?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    @{a.pseudo}
                    {a.membre_fondateur && <span style={{ fontSize: '0.85rem' }}>🌟</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B6255' }}>
                    {a.textes} texte{a.textes > 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#D4321F', fontSize: '0.95rem' }}>
                  ❤️ {a.likes}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
