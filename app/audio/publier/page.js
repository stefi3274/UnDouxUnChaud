import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import PublierAudioForm from './PublierAudioForm';

export default function PublierAudioPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Proposer un audio</h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 24,
          background: '#E3F1EF', color: '#0A5F63', padding: '8px 16px', borderRadius: 100,
          fontSize: '0.82rem', fontWeight: 600,
        }}>
          ⏱️ Relu et publié sous 72h à 1 semaine
        </div>
        <PublierAudioForm />
      </main>
    </>
  );
}
