import { supabasePublic } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import TextesFeed from '@/app/components/TextesFeed';
import AdBanner from '@/app/components/AdBanner';

// Server Component : cette fonction tourne côté serveur à chaque
// chargement de page, avant l'envoi du HTML au navigateur.
async function getTextesAcceptes() {
  const { data, error } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, contenu, categorie, date_publication, user_id, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Erreur chargement textes:', error.message);
    return [];
  }
  return data;
}

async function getPubsActives() {
  const { data, error } = await supabasePublic
    .from('udc_ads')
    .select('*')
    .eq('actif', true)
    .order('ordre', { ascending: true });

  if (error) return { fil: [], banniere: [] };
  return {
    fil: data.filter((a) => a.emplacement === 'fil'),
    banniere: data.filter((a) => a.emplacement === 'banniere'),
  };
}

export default async function HomePage() {
  const [textes, pubs] = await Promise.all([getTextesAcceptes(), getPubsActives()]);
  const user = getSessionUser();

  return (
    <>
      <HeaderNav user={user} />

      <section className="hero">
        <h1>Du tendre <em>au brûlant,</em><br />un texte à la fois.</h1>
        <p>
          Des récits écrits par sa communauté, classés du plus doux au plus
          piquant. Lecture libre pour tous, un compte pour écrire, aimer et
          commenter.
        </p>
        <div className="hero-ctas">
          {user ? (
            <a href="/ecrire" className="btn-primary">✍️ Écrire mon texte</a>
          ) : (
            <a href="/inscription" className="btn-primary">Créer un compte pour écrire</a>
          )}
          <a href="#fil" className="btn-outline">Découvrir les textes</a>
        </div>
      </section>

      <div className="scale-strip">
        <div className="scale-title">L'échelle des saveurs</div>
        <div className="scale-item">
          <span className="scale-dot" style={{ background: '#E85D8A' }} />
          Un Doux
        </div>
        <div className="scale-item">
          <span className="scale-dot" style={{ background: '#3F8F5C' }} />
          Un Chaud
        </div>
        <div className="scale-item">
          <span className="scale-dot" style={{ background: '#E08A1D' }} />
          Piment
        </div>
        <div className="scale-item">
          <span className="scale-dot" style={{ background: '#D4321F' }} />
          Piquant
        </div>
        <div className="scale-item">
          <span className="scale-dot" style={{ background: '#9B5FC0' }} />
          Poèmes
        </div>
      </div>

      <div id="fil" />
      <AdBanner ads={pubs.banniere} />
      <TextesFeed textes={textes} hasAccount={!!user} ads={pubs.fil} />
    </>
  );
}
