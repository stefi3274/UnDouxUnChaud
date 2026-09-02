import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import PostGenerator from './PostGenerator';

export default async function AdminPostsPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const { data: textes } = await supabaseAdmin
    .from('udc_textes')
    .select('id, titre, contenu, categorie, image_url, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false })
    .limit(200);

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Créer un post</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 24 }}>
          Choisis un texte publié, ajuste l'extrait si besoin, puis télécharge le visuel 1080×1080 pour X, Facebook ou Instagram.
        </p>
        <PostGenerator textes={textes || []} />
      </main>
    </>
  );
}
