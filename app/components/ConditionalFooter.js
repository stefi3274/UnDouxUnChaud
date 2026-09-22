'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// La messagerie doit rester dédiée aux messages : pas de pied de page
// (liens À propos / Contact / "Créé par SteFi Services") sur ces écrans.
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/messages')) return null;
  return <Footer />;
}
