import { supabasePublic } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import TextesFeed from '@/app/components/TextesFeed';

async function getTextesCreole() {
  const { data, error } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, contenu, categorie, langue, date_publication, user_id, vues, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .eq('langue', 'ht')
    .order('date_publication', { ascending: false })
    .limit(60);

  if (error) return [];

  const ids = data.map((t) => t.id);
  if (ids.length === 0) return [];

  const [{ data: likes }, { data: commentaires }] = await Promise.all([
    supabasePublic.from('udc_likes').select('texte_id').in('texte_id', ids),
    supabasePublic.from('udc_commentaires').select('texte_id').in('texte_id', ids),
  ]);
  const compte = (lignes, id) => (lignes || []).filter((l) => l.texte_id === id).length;

  return data.map((t) => ({ ...t, likeCount: compte(likes, t.id), commentCount: compte(commentaires, t.id) }));
}

export default async function CreolePage() {
  const user = getSessionUser();
  const textes = await getTextesCreole();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '5vw 6vw 0' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Textes en Kreyòl</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 8 }}>
          Tout tèks ki ekri an kreyòl ayisyen — menm echèl, menm kominote.
        </p>
      </main>
      <TextesFeed textes={textes} hasAccount={!!user} ads={[]} />
    </>
  );
}
