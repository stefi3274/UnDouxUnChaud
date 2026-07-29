import { notFound } from 'next/navigation';
import { supabasePublic, supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import TexteInteractions from './TexteInteractions';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
  poemes: 'Poèmes',
};

async function getTexte(id) {
  const { data } = await supabasePublic
    .from('udc_textes')
    .select('*, udc_users(pseudo)')
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

export default async function TextePage({ params }) {
  const texte = await getTexte(params.id);
  if (!texte) notFound();

  const [comments, likeCount] = await Promise.all([
    getCommentaires(texte.id),
    getLikeCount(texte.id),
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

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <span className={`badge ${texte.categorie}`}>
          {LABELS_CATEGORIE[texte.categorie]}
        </span>
        <h1 style={{ fontFamily: 'Fraunces, serif', marginTop: 10 }}>{texte.titre}</h1>
        <div style={{ color: '#6B6255', fontSize: '0.88rem', marginTop: 10 }}>
          <span style={{ color: '#0A5F63', fontWeight: 700 }}>@{texte.udc_users?.pseudo}</span>
          {' · '}
          {texte.date_publication ? new Date(texte.date_publication).toLocaleDateString('fr-FR') : ''}
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

        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', lineHeight: 1.85, marginTop: 28, whiteSpace: 'pre-wrap' }}>
          {texte.contenu}
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
