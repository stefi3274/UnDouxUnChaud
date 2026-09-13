import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import ConcoursAdmin from './ConcoursAdmin';

export default function AdminConcoursPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');
  if (user.role !== 'admin') redirect('/');

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Concours</h1>
        <ConcoursAdmin />
      </main>
    </>
  );
}
