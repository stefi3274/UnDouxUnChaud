import { supabasePublic, supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import Link from 'next/link';
import HeaderNav from '@/app/components/HeaderNav';
import TextesFeed from '@/app/components/TextesFeed';
import AdBanner from '@/app/components/AdBanner';
import VignettesRow from '@/app/components/VignettesRow';
import SplashScreen from '@/app/components/SplashScreen';

// Server Component : cette fonction tourne côté serveur à chaque
// chargement de page, avant l'envoi du HTML au navigateur.
async function getTextesAcceptes() {
  const { data, error } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, contenu, categorie, langue, date_publication, user_id, vues, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Erreur chargement textes:', error.message);
    return [];
  }

  const ids = (data || []).map((t) => t.id);
  if (ids.length === 0) return [];

  const [{ data: likes }, { data: commentaires }] = await Promise.all([
    supabasePublic.from('udc_likes').select('texte_id').in('texte_id', ids),
    supabasePublic.from('udc_commentaires').select('texte_id').in('texte_id', ids),
  ]);

  const compte = (lignes, id) => (lignes || []).filter((l) => l.texte_id === id).length;

  return data.map((t) => ({
    ...t,
    likeCount: compte(likes, t.id),
    commentCount: compte(commentaires, t.id),
  }));
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

async function ajouterSignedUrls(textes) {
  return Promise.all(
    textes.map(async (t) => {
      if (!t.image_url) return { ...t, imageSignedUrl: null };
      const { data } = await supabaseAdmin.storage.from('textes-images').createSignedUrl(t.image_url, 3600);
      return { ...t, imageSignedUrl: data?.signedUrl || null };
    })
  );
}

async function getCoupsDeCoeur() {
  const { data } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, categorie, image_url, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .eq('coup_de_coeur', true)
    .order('date_publication', { ascending: false })
    .limit(6);
  return ajouterSignedUrls(data || []);
}

async function getMieuxNotes() {
  const { data: classement } = await supabaseAdmin.rpc('textes_mieux_notes', { limite: 6 });
  if (!classement || classement.length === 0) return [];

  const ids = classement.map((c) => c.texte_id);
  const { data: textes } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, categorie, image_url, udc_users(pseudo)')
    .in('id', ids)
    .eq('statut', 'accepte');

  const parId = Object.fromEntries((textes || []).map((t) => [t.id, t]));
  const ordonnes = classement.map((c) => parId[c.texte_id]).filter(Boolean).map((t, i) => ({
    ...t, moyenne: Number(classement[i]?.moyenne) || 0,
  }));
  return ajouterSignedUrls(ordonnes);
}

export default async function HomePage() {
  const [textes, pubs, coupsDeCoeur, mieuxNotes] = await Promise.all([
    getTextesAcceptes(), getPubsActives(), getCoupsDeCoeur(), getMieuxNotes(),
  ]);
  const user = getSessionUser();

  return (
    <>
      <SplashScreen />
      <HeaderNav user={user} />

      <section className="hero">
        <div className="hero-texte">
          <h1>Du tendre <em>au brûlant,</em><br />un texte à la fois.</h1>
          <p>
            Des récits écrits par sa communauté, classés du plus doux au plus
            piquant. Lecture libre pour tous, un compte pour écrire, aimer et
            commenter.
          </p>
          <div className="hero-ctas">
            {user ? (
              <Link href="/ecrire" className="btn-primary">✍️ Écrire mon texte</Link>
            ) : (
              <Link href="/inscription" className="btn-primary">Créer un compte pour écrire</Link>
            )}
            <a href="#fil" className="btn-outline">Découvrir les textes</a>
          </div>
        </div>
        <div className="hero-logo">
          <img src="/logo.jpg" alt="UnDouxUnChaud" />
        </div>
      </section>

      <div id="fil" />
      <VignettesRow titre="Coups de cœur" icone="🌟" textes={coupsDeCoeur} />
      <VignettesRow titre="Les mieux notés" icone="⭐" textes={mieuxNotes} />
      <AdBanner ads={pubs.banniere} />
      <TextesFeed textes={textes} hasAccount={!!user} ads={pubs.fil} />
    </>
  );
}
