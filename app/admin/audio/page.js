import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import AudioQueue from './AudioQueue';

export default async function AdminAudioPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const { data: enAttenteRaw } = await supabaseAdmin
    .from('udc_audios')
    .select('id, titre, description, categorie, audio_path, date_soumission, udc_users(pseudo)')
    .eq('statut', 'en_attente')
    .order('date_soumission', { ascending: true });

  const enAttente = await Promise.all(
    (enAttenteRaw || []).map(async (a) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('audios-files')
        .createSignedUrl(a.audio_path, 3600);
      return { ...a, url: signed?.signedUrl || null };
    })
  );

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Audio — file d'attente</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 20 }}>
          {enAttente.length} audio{enAttente.length > 1 ? 's' : ''} en attente de relecture.
        </p>
        <AudioQueue audios={enAttente} />
      </main>
    </>
  );
}
