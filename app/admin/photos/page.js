import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import PhotosQueue from './PhotosQueue';
import AjouterPhotoAdmin from './AjouterPhotoAdmin';

export default async function AdminPhotosPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const { data: enAttenteRaw } = await supabaseAdmin
    .from('udc_photos')
    .select('id, titre, description, categorie, image_path, date_soumission, udc_users(pseudo)')
    .eq('statut', 'en_attente')
    .order('date_soumission', { ascending: true });

  const enAttente = await Promise.all(
    (enAttenteRaw || []).map(async (p) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('photos-images')
        .createSignedUrl(p.image_path, 3600);
      return { ...p, url: signed?.signedUrl || null };
    })
  );

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Photos</h1>
        <p style={{ color: '#6B6255', marginTop: 8 }}>
          Ajoute directement une photo à la galerie, ou relis les propositions de la communauté.
        </p>

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', marginTop: 32, marginBottom: 14 }}>
          Ajouter à la galerie
        </h2>
        <AjouterPhotoAdmin />

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', marginTop: 40, marginBottom: 14 }}>
          En attente ({enAttente.length})
        </h2>
        <PhotosQueue photos={enAttente} />
      </main>
    </>
  );
}
