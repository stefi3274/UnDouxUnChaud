import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import ConversationView from './ConversationView';

export default async function ConversationPage({ params }) {
  const user = getSessionUser();
  if (!user) redirect('/connexion');

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 620, margin: '0 auto', padding: '5vw 6vw 0' }}>
        <ConversationView conversationId={params.id} moi={user} />
      </main>
    </>
  );
}
