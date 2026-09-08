import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabasePublic, supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import TexteInteractions from './TexteInteractions';
import MessageAuteurButton from './MessageAuteurButton';
import RegistrerLecture from './RegistrerLecture';
import CoupDeCoeurToggle from './CoupDeCoeurToggle';
import { EtoilesAffichage, EtoilesVote } from '@/app/components/Etoiles';
import { lireIdentifiant } from '@/lib/visiteur';

const COULEURS_CATEGORIE = {
  un_doux: '#E85D8A',
  un_chaud: '#3F8F5C',
  piment: '#E08A1D',
  piquant: '#D4321F',
  poemes: '#9B5FC0',
  chat_fiction: '#C9A227',
};
import { urlAvatar } from '@/lib/avatar';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
  poemes: 'Poèmes et Lettres',
  chat_fiction: 'Chat Fiction',
};

async function getTexte(id) {
  const { data } = await supabasePublic
    .from('udc_textes')
    .select('*, udc_users(pseudo, avatar_path)')
    .eq('id', id)
    .eq('statut', 'accepte')
    .maybeSingle();
  return data;
}

async function getCommentaires(texteId) {
  const { data } = await supabasePublic
    .from('udc_commentaires')
    .select('*, udc_users(pseudo)')
    .eq('texte_id', texteId)
    .order('created_at', { ascending: true });
  return data || [];
}

async function getLikeCount(texteId) {
  const { count } = await supabasePublic
    .from('udc_likes')
    .select('*', { count: 'exact', head: true })
    .eq('texte_id', texteId);
  return count || 0;
}

async function getChapitres(userId, serieTitre) {
  if (!serieTitre) return [];
  const { data } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, chapitre_numero')
    .eq('statut', 'accepte')
    .eq('user_id', userId)
    .eq('serie_titre', serieTitre)
    .order('chapitre_numero', { ascending: true });
  return data || [];
}

export default async function TextePage({ params }) {
  const texte = await getTexte(params.id);
  if (!texte) notFound();

  const [comments, likeCount, chapitres] = await Promise.all([
    getCommentaires(texte.id),
    getLikeCount(texte.id),
    getChapitres(texte.user_id, texte.serie_titre),
  ]);
  const user = getSessionUser();

  let dejaLike = false;
  if (user) {
    const { data: likeExistant } = await supabasePublic
      .from('udc_likes')
      .select('id')
      .eq('texte_id', texte.id)
      .eq('user_id', user.id)
      .maybeSingle();
    dejaLike = !!likeExistant;
  }

  let imageSignedUrl = null;
  if (texte.image_url) {
    const { data } = await supabaseAdmin.storage
      .from('textes-images')
      .createSignedUrl(texte.image_url, 3600); // valide 1h
    imageSignedUrl = data?.signedUrl || null;
  }

  const { data: notes } = await supabasePublic.from('udc_notes').select('note, identifiant').eq('texte_id', texte.id);
  const totalNotes = notes?.length || 0;
  const moyenneNotes = totalNotes > 0 ? notes.reduce((s, n) => s + n.note, 0) / totalNotes : 0;
  const monIdentifiant = lireIdentifiant();
  const maNote = notes?.find((n) => n.identifiant === monIdentifiant)?.note || 0;
  const couleurCategorie = COULEURS_CATEGORIE[texte.categorie] || '#0A5F63';

  return (
    <>
      <HeaderNav user={user} />
      <RegistrerLecture texteId={texte.id} />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <span className={`badge ${texte.categorie}`}>
          {LABELS_CATEGORIE[texte.categorie]}
        </span>
        {texte.langue === 'ht' && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: '#6B6255', border: '1px solid #DDD2BC',
            borderRadius: 100, padding: '3px 10px', marginLeft: 8,
          }}>
            HT
          </span>
        )}
        <h1 style={{ fontFamily: 'Fraunces, serif', marginTop: 10 }}>{texte.titre}</h1>

        {texte.serie_titre && (
          <div style={{ marginTop: 10, background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, color: '#0A5F63', fontSize: '0.88rem' }}>
              📚 {texte.serie_titre}{texte.chapitre_numero ? ` — Chapitre ${texte.chapitre_numero}` : ''}
            </div>
            {chapitres.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {chapitres.map((c) => (
                  <Link
                    key={c.id}
                    href={`/textes/${c.id}`}
                    style={{
                      padding: '5px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600,
                      textDecoration: 'none',
                      background: c.id === texte.id ? '#0A5F63' : '#fff',
                      color: c.id === texte.id ? '#fff' : '#2B2620',
                      border: '1px solid #DDD2BC',
                    }}
                  >
                    Chap. {c.chapitre_numero ?? '?'}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ color: '#6B6255', fontSize: '0.88rem', marginTop: 10, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {(() => {
            const avatar = urlAvatar(texte.udc_users?.avatar_path);
            return avatar ? (
              <img src={avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />
            ) : null;
          })()}
          <span style={{ color: '#0A5F63', fontWeight: 700 }}>@{texte.udc_users?.pseudo}</span>
          {' · '}
          {texte.date_publication ? new Date(texte.date_publication).toLocaleDateString('fr-FR') : ''}
          {' · '}👁️ {texte.vues || 0} lecture{(texte.vues || 0) > 1 ? 's' : ''}
          {(!user || user.id !== texte.user_id) && (
            <MessageAuteurButton auteurId={texte.user_id} connecte={!!user} />
          )}
          {user?.role === 'admin' && (
            <span style={{ marginLeft: 10 }}>
              <CoupDeCoeurToggle texteId={texte.id} actif={!!texte.coup_de_coeur} />
            </span>
          )}
        </div>

        {texte.avertissements?.length > 0 && (
          <div style={{
            marginTop: 20, background: '#FBF1DF', border: '1px solid #CE8B33',
            borderRadius: 12, padding: '14px 18px', fontSize: '0.85rem', color: '#7A5419',
          }}>
            <strong>Avertissement de contenu</strong><br />
            {texte.avertissements.join(', ')}
          </div>
        )}

        {imageSignedUrl && (
          <>
            <img src={imageSignedUrl} alt="" style={{ width: '100%', borderRadius: 14, marginTop: 20 }} />
            {texte.image_credit && (
              <p style={{ fontSize: '0.78rem', color: '#6B6255', marginTop: 8, textAlign: 'right' }}>
                {texte.image_credit}
              </p>
            )}
          </>
        )}

        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: '1.1rem', lineHeight: 1.9, marginTop: 28,
          whiteSpace: 'pre-wrap', color: '#000000', background: '#FFFFFF',
          padding: '28px 24px', borderRadius: 16, border: '1px solid #DDD2BC',
        }}>
          {texte.contenu}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: 16, marginTop: 24, padding: '16px 20px', background: '#F8F3E8',
          border: '1px solid #DDD2BC', borderRadius: 14,
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B6255', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Note moyenne {totalNotes > 0 && `(${totalNotes} vote${totalNotes > 1 ? 's' : ''})`}
            </div>
            <EtoilesAffichage valeur={moyenneNotes} couleur={couleurCategorie} taille="1.3rem" />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B6255', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Ton avis
            </div>
            <EtoilesVote texteId={texte.id} couleur={couleurCategorie} maNoteInitiale={maNote} />
          </div>
        </div>

        <TexteInteractions
          texteId={texte.id}
          auteurId={texte.user_id}
          initialLikes={likeCount}
          initiallyLiked={dejaLike}
          comments={comments}
          user={user}
        />
      </main>
    </>
  );
}
