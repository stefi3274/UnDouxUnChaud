import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import ConversationView from './ConversationView';

export default async function ConversationPage({ params }) {
  const user = getSessionUser();
  if (!user) redirect('/connexion');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <HeaderNav user={user} />
      <main style={{
        maxWidth: 620, width: '100%', margin: '0 auto', padding: '0 6vw',
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      }}>
        <ConversationView conversationId={params.id} moi={user} />
      </main>
    </div>
  );
}
