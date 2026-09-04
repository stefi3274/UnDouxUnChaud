import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import AudioList from './AudioList';

async function getAudios() {
  const { data } = await supabaseAdmin
    .from('udc_audios')
    .select('id, titre, description, categorie, audio_path, duree_secondes, vues, date_publication, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false })
    .limit(60);

  if (!data) return [];

  return Promise.all(
    data.map(async (a) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('audios-files')
        .createSignedUrl(a.audio_path, 3600);
      return { ...a, url: signed?.signedUrl || null };
    })
  );
}

export default async function AudioPage() {
  const user = getSessionUser();
  const audios = await getAudios();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Audio</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 24 }}>
          Des textes à écouter, du tendre au brûlant.
        </p>
        <AudioList audios={audios} connecte={!!user} />
      </main>
    </>
  );
}
