import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HeaderNav from '@/app/components/HeaderNav';
import AvatarUpload from './AvatarUpload';
import { urlAvatar } from '@/lib/avatar';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux',
  un_chaud: 'Un Chaud',
  piment: 'Piment',
  piquant: 'Piquant',
  poemes: 'Poèmes et Lettres',
  chat_fiction: 'Chat Fiction',
};
const LABELS_STATUT = {
  en_attente: { label: 'En attente', bg: '#FBF1DF', color: '#8A6412' },
  accepte: { label: 'Accepté', bg: '#E3F1EF', color: '#0A5F63' },
  refuse: { label: 'Refusé', bg: '#FBE7E4', color: '#B23A2E' },
};

export default async function ProfilPage() {
  const user = getSessionUser();
  if (!user) redirect('/connexion');

  // supabaseAdmin utilisé ici car on doit voir SES PROPRES textes
  // quel que soit leur statut (en_attente/refusé inclus), ce que la
  // policy RLS publique ne permet pas.
  const { data: mesTextes } = await supabaseAdmin
    .from('udc_textes')
    .select('id, titre, categorie, statut, raison_refus, date_soumission, date_publication')
    .eq('user_id', user.id)
    .order('date_soumission', { ascending: false });

  const { data: mesCommentaires } = await supabaseAdmin
    .from('udc_commentaires')
    .select('id, contenu, created_at, texte_id, udc_textes(titre)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: moi } = await supabaseAdmin
    .from('udc_users')
    .select('avatar_path')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <AvatarUpload avatarUrl={urlAvatar(moi?.avatar_path)} pseudo={user.pseudo} />
          <h1 style={{ fontFamily: 'Fraunces, serif' }}>@{user.pseudo}</h1>
        </div>

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', marginTop: 32, marginBottom: 16 }}>
          Mes textes
        </h2>
        {(!mesTextes || mesTextes.length === 0) && (
          <p style={{ color: '#6B6255' }}>Tu n'as encore rien soumis.</p>
        )}
        {mesTextes?.map((t) => {
          const s = LABELS_STATUT[t.statut];
          return (
            <div key={t.id} style={{
              background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 14,
              padding: '16px 18px', marginBottom: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.05rem' }}>{t.titre}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#6B6255', marginTop: 4 }}>
                    {LABELS_CATEGORIE[t.categorie]} · {new Date(t.date_soumission).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <span style={{ background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 700, padding: '5px 14px', borderRadius: 100 }}>
                  {s.label}
                </span>
              </div>
              {t.statut === 'refuse' && t.raison_refus && (
                <div style={{ marginTop: 10, background: '#FBE7E4', color: '#8A3226', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem' }}>
                  <strong>Raison du refus :</strong> {t.raison_refus}
                </div>
              )}
              {t.statut === 'en_attente' && (
                <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#6B6255' }}>
                  ⏱️ Réponse sous 72h à 1 semaine
                </div>
              )}
            </div>
          );
        })}

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', marginTop: 40, marginBottom: 16 }}>
          Mes commentaires
        </h2>
        {(!mesCommentaires || mesCommentaires.length === 0) && (
          <p style={{ color: '#6B6255' }}>Aucun commentaire pour le moment.</p>
        )}
        {mesCommentaires?.map((c) => (
          <div key={c.id} style={{
            background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 14,
            padding: '16px 18px', marginBottom: 14,
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6B6255', marginBottom: 6 }}>
              Sur <Link href={`/textes/${c.texte_id}`} style={{ color: '#0A5F63', fontWeight: 700 }}>{c.udc_textes?.titre}</Link>
              {' · '}{new Date(c.created_at).toLocaleDateString('fr-FR')}
            </div>
            <p style={{ fontSize: '0.9rem' }}>{c.contenu}</p>
          </div>
        ))}
      </main>
    </>
  );
}
