import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';

export default function AProposPage() {
  const user = getSessionUser();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '6vw 6vw 8vw' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>À propos</h1>
        <p style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.3rem',
          color: '#0A5F63', marginTop: 14, lineHeight: 1.5,
        }}>
          Donner la parole aux désirs et aux passions.
        </p>

        <div style={{ marginTop: 28, fontSize: '1rem', lineHeight: 1.8, color: '#2B2620' }}>
          <p>
            UnDouxUnChaud est un magazine érotique né d'une conviction simple : le désir
            mérite d'être écrit, lu et partagé avec autant de soin que n'importe quelle
            autre émotion humaine.
          </p>
          <p style={{ marginTop: 18 }}>
            Ici, chaque texte trouve sa place sur une échelle qui va du tendre au brûlant —
            Un Doux, Un Chaud, Piment, Piquant, Poèmes et Lettres — pour que chaque lecteur et
            chaque lectrice trouve exactement l'intensité qu'il ou elle cherche.
          </p>
          <p style={{ marginTop: 18 }}>
            C'est aussi un espace communautaire : chacun peut proposer ses propres
            textes, les voir relus avec attention, puis publiés pour être lus, aimés,
            commentés — et, pourquoi pas, inspirer d'autres plumes.
          </p>
          <p style={{ marginTop: 18 }}>
            Un projet imaginé et développé par <strong>SteFi Services</strong> — une
            équipe dynamique qui croit à la verbalisation des sentiments et des
            sensations.
          </p>
        </div>
      </main>
    </>
  );
}
