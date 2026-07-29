import { supabasePublic } from '@/lib/supabase';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
};

// Server Component : cette fonction tourne côté serveur à chaque
// chargement de page, avant l'envoi du HTML au navigateur.
async function getTextesAcceptes() {
  const { data, error } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, contenu, categorie, date_publication, user_id, udc_users(pseudo)')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Erreur chargement textes:', error.message);
    return [];
  }
  return data;
}

export default async function HomePage() {
  const textes = await getTextesAcceptes();

  return (
    <>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 6vw', borderBottom: '1px solid #DDD2BC',
      }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 600 }}>
          UnDouxUnChaud
        </div>
        <nav style={{ display: 'flex', gap: 16 }}>
          <a href="/inscription" style={{ color: '#2B2620', textDecoration: 'none', fontWeight: 600 }}>
            Créer un compte
          </a>
          <a href="/connexion" style={{
            background: '#0E7C81', color: '#fff', padding: '8px 18px',
            borderRadius: 100, textDecoration: 'none', fontWeight: 600,
          }}>
            Se connecter
          </a>
        </nav>
      </header>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '5vw 6vw' }}>
      {textes.length === 0 && (
        <p style={{ color: '#6B6255', marginTop: 20 }}>
          Aucun texte publié pour le moment.
        </p>
      )}

      <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {textes.map((texte) => (
          <a
            key={texte.id}
            href={`/textes/${texte.id}`}
            style={{
              display: 'block',
              padding: 20,
              borderRadius: 14,
              border: '1px solid #DDD2BC',
              background: '#F8F3E8',
              textDecoration: 'none',
              color: '#2B2620',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {LABELS_CATEGORIE[texte.categorie]}
            </span>
            <h3 style={{ fontFamily: 'Fraunces, serif', marginTop: 6 }}>{texte.titre}</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B6255', marginTop: 6 }}>
              {texte.udc_users?.pseudo}
            </p>
          </a>
        ))}
      </div>
      </main>
    </>
  );
}
