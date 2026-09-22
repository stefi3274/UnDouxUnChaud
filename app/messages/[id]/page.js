import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import ConversationView from './ConversationView';

// Écran dédié entièrement à la conversation : pas d'en-tête du site
// (logo, menu, notifications) au-dessus, seulement les messages et
// l'identité de l'interlocuteur (déjà affichée par ConversationView,
// avec son propre bouton retour).
export default async function ConversationPage({ params }) {
  const user = getSessionUser();
  if (!user) redirect('/connexion');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <main style={{
        maxWidth: 620, width: '100%', margin: '0 auto', padding: '0 6vw',
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      }}>
        <ConversationView conversationId={params.id} moi={user} />
      </main>
    </div>
  );
}
