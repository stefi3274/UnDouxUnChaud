import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import GestionTextesPublies from './GestionTextesPublies';

export default async function AdminTextesPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const { data: textes } = await supabaseAdmin
    .from('udc_textes')
    .select('id, titre, categorie, langue, vues, coup_de_coeur, date_publication, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false });

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Textes publiés</h1>
        <p style={{ color: '#6B6255', marginTop: 8 }}>
          {textes?.length || 0} texte{(textes?.length || 0) > 1 ? 's' : ''} en ligne. Suppression définitive et immédiate.
        </p>
        <GestionTextesPublies textesInitial={textes || []} />
      </main>
    </>
  );
}
