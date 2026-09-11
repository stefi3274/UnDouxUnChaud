import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import RechercheBox from './RechercheBox';

export default function RecherchePage() {
  const user = getSessionUser();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Recherche</h1>
        <RechercheBox />
      </main>
    </>
  );
}
