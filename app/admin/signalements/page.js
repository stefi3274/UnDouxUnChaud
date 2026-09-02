import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import SignalementsList from './SignalementsList';

export default async function AdminSignalementsPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  const { data: signalements } = await supabaseAdmin
    .from('udc_signalements')
    .select('id, raison, traite, created_at, conversation_id, reporter:reporter_id(pseudo), reported:reported_id(pseudo)')
    .order('created_at', { ascending: false });

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Signalements</h1>
        <SignalementsList initial={signalements || []} />
      </main>
    </>
  );
}
