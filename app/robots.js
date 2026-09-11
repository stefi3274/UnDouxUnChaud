export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/messages', '/profil', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe'],
      },
    ],
    sitemap: 'https://un-doux-un-chaud.vercel.app/sitemap.xml',
  };
}
