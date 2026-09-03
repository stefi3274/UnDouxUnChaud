import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import AdminQueue from './AdminQueue';

export default async function AdminPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const { data: textesRaw } = await supabaseAdmin
    .from('udc_textes')
    .select('*, udc_users(pseudo, avatar_path)')
    .eq('statut', 'en_attente')
    .order('date_soumission', { ascending: true });

  const textes = await Promise.all(
    (textesRaw || []).map(async (t) => {
      if (!t.image_url) return { ...t, image_signed_url: null };
      const { data } = await supabaseAdmin.storage
        .from('textes-images')
        .createSignedUrl(t.image_url, 3600);
      return { ...t, image_signed_url: data?.signedUrl || null };
    })
  );

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'Fraunces, serif' }}>File d'attente</h1>
          <Link href="/admin/posts" className="btn-outline" style={{ padding: '9px 18px' }}>🖼️ Créer un post</Link>
        </div>
        <p style={{ color: '#6B6255', marginTop: 8 }}>
          {textes?.length || 0} texte{(textes?.length || 0) > 1 ? 's' : ''} en attente de relecture.
        </p>
        <AdminQueue textes={textes || []} />
      </main>
    </>
  );
}
