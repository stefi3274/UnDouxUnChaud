import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import GalerieGrid from './GalerieGrid';

async function getPhotos() {
  const { data } = await supabaseAdmin
    .from('udc_photos')
    .select('id, titre, description, categorie, image_path, source, date_publication, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false })
    .limit(60);

  if (!data) return [];

  return Promise.all(
    data.map(async (p) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('photos-images')
        .createSignedUrl(p.image_path, 3600);
      return { ...p, url: signed?.signedUrl || null };
    })
  );
}

export default async function GaleriePage() {
  const user = getSessionUser();
  const photos = await getPhotos();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Galerie</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 24 }}>
          Photographies et clichés suggestifs, du tendre au brûlant — sélectionnés avec soin.
        </p>
        <GalerieGrid photos={photos} connecte={!!user} />
      </main>
    </>
  );
}
