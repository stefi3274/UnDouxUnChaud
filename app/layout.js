import './globals.css';
import Footer from './components/Footer';
import AgeGate from './components/AgeGate';

export const metadata = {
  metadataBase: new URL('https://un-doux-un-chaud.vercel.app'),
  title: {
    default: 'UnDouxUnChaud — Magazine Érotique',
    template: '%s — UnDouxUnChaud',
  },
  description: "Du tendre au brûlant, un texte à la fois.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'UnDouxUnChaud — Magazine Érotique',
    description: "Du tendre au brûlant, un texte à la fois.",
    images: ['/logo.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500;1,9..144,600&family=Public+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Footer />
        <AgeGate />
      </body>
    </html>
  );
}
