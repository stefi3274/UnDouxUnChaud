import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import NotificationsList from './NotificationsList';

export default function NotificationsPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 620, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Notifications</h1>
        <NotificationsList />
      </main>
    </>
  );
}
