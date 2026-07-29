import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import AdminQueue from './AdminQueue';

export default async function AdminPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const { data: textes } = await supabaseAdmin
    .from('udc_textes')
    .select('*, udc_users(pseudo)')
    .eq('statut', 'en_attente')
    .order('date_soumission', { ascending: true });

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>File d'attente</h1>
        <p style={{ color: '#6B6255', marginTop: 8 }}>
          {textes?.length || 0} texte{(textes?.length || 0) > 1 ? 's' : ''} en attente de relecture.
        </p>
        <AdminQueue textes={textes || []} />
      </main>
    </>
  );
}
