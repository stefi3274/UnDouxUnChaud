import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import EcrireForm from './EcrireForm';

export default function EcrirePage() {
  const user = getSessionUser();
  if (!user) {
    redirect('/connexion');
  }

  return (
    <>
      <HeaderNav user={user} />
      <EcrireForm />
    </>
  );
}
