import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import AdsManager from './AdsManager';

export default async function AdminPubsPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Publicités</h1>
        <p style={{ color: '#6B6255', marginTop: 8, marginBottom: 24 }}>
          Crée des pubs pour le fil de textes ou pour le bandeau d'accueil. Chaque pub est clairement étiquetée « Publicité » sur le site.
        </p>
        <AdsManager />
      </main>
    </>
  );
}
