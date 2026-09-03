import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';

export default function MentionsLegalesPage() {
  const user = getSessionUser();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '6vw 6vw 8vw', fontSize: '0.92rem', lineHeight: 1.75, color: '#2B2620' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Mentions légales</h1>

        <h2 style={sectionStyle}>Éditeur du site</h2>
        <p>
          Le site UnDouxUnChaud est édité par SteFi Services — une équipe dynamique
          qui croit à la verbalisation des sentiments et des sensations.<br />
          Contact : jecrisdestexteserotiques@gmail.com
        </p>

        <h2 style={sectionStyle}>Développement</h2>
        <p>Le site a été conçu et développé par SteFi Services.</p>

        <h2 style={sectionStyle}>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc. Les données (comptes, textes, messages,
          images) sont stockées via Supabase.
        </p>

        <h2 style={sectionStyle}>Accès réservé aux adultes</h2>
        <p>
          Ce site contient des textes à caractère érotique et s'adresse exclusivement à
          un public majeur (18 ans ou plus). En poursuivant la navigation, l'utilisateur
          confirme être majeur dans son pays de résidence.
        </p>

        <h2 style={sectionStyle}>Propriété intellectuelle</h2>
        <p>
          L'ensemble des textes publiés reste la propriété de leurs auteur·rice·s
          respectif·ve·s, qui en autorisent la publication sur UnDouxUnChaud. Toute
          reproduction, diffusion ou exploitation en dehors du site, sans autorisation
          de l'auteur·rice concerné·e, est interdite.
        </p>

        <h2 style={sectionStyle}>Comptes et données personnelles</h2>
        <p>
          La création d'un compte nécessite un pseudonyme et une adresse e-mail. Le
          pseudonyme est seul visible publiquement ; l'adresse e-mail n'est jamais
          affichée et sert uniquement à la connexion et à la réinitialisation du mot de
          passe. Les messages échangés entre utilisateurs sont privés.
        </p>

        <h2 style={sectionStyle}>Cookies et stockage local</h2>
        <p>
          Le site utilise un cookie de connexion nécessaire au fonctionnement du
          compte, ainsi que le stockage local du navigateur pour retenir la
          confirmation d'âge. Aucun cookie publicitaire ou de suivi tiers n'est utilisé.
        </p>

        <h2 style={sectionStyle}>Responsabilité</h2>
        <p>
          Les textes publiés sont relus avant mise en ligne, mais restent l'expression
          personnelle de leurs auteur·rice·s. UnDouxUnChaud ne saurait être tenu
          responsable du contenu des textes publiés par sa communauté.
        </p>

        <h2 style={sectionStyle}>Contact</h2>
        <p>
          Pour toute question relative à ces mentions légales :{' '}
          <a href="mailto:jecrisdestexteserotiques@gmail.com" style={{ color: '#0A5F63' }}>
            jecrisdestexteserotiques@gmail.com
          </a>
        </p>
      </main>
    </>
  );
}

const sectionStyle = { fontFamily: 'Fraunces, serif', fontSize: '1.05rem', marginTop: 26, marginBottom: 6 };
