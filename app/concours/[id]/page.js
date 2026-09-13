import { notFound } from 'next/navigation';
import { supabasePublic, supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import HeaderNav from '@/app/components/HeaderNav';
import Link from 'next/link';
import BoutonsPartage from '@/app/components/BoutonsPartage';

const LABELS_CATEGORIE = {
  un_doux: 'Un Doux', un_chaud: 'Un Chaud', piment: 'Piment', piquant: 'Piquant',
  poemes: 'Poèmes et Lettres', chat_fiction: 'Chat Fiction',
};

async function getConcours(id) {
  const { data } = await supabasePublic.from('udc_concours').select('*').eq('id', id).maybeSingle();
  return data;
}

async function getTextesDuConcours(concoursId) {
  const { data } = await supabasePublic
    .from('udc_textes')
    .select('id, titre, categorie, vues, udc_users(pseudo)')
    .eq('concours_id', concoursId)
    .eq('statut', 'accepte');

  if (!data || data.length === 0) return [];

  const ids = data.map((t) => t.id);
  const [{ data: commentaires }, { data: notes }] = await Promise.all([
    supabasePublic.from('udc_commentaires').select('texte_id').in('texte_id', ids),
    supabasePublic.from('udc_notes').select('texte_id, note').in('texte_id', ids),
  ]);

  const commentairesParTexte = {};
  for (const c of commentaires || []) commentairesParTexte[c.texte_id] = (commentairesParTexte[c.texte_id] || 0) + 1;

  const notesParTexte = {};
  for (const n of notes || []) {
    if (!notesParTexte[n.texte_id]) notesParTexte[n.texte_id] = { total: 0, count: 0 };
    notesParTexte[n.texte_id].total += n.note;
    notesParTexte[n.texte_id].count += 1;
  }

  return data.map((t) => ({
    ...t,
    nbCommentaires: commentairesParTexte[t.id] || 0,
    moyenneNotes: notesParTexte[t.id] ? notesParTexte[t.id].total / notesParTexte[t.id].count : 0,
    nbNotes: notesParTexte[t.id]?.count || 0,
  }));
}

function Classement({ titre, icone, textes, valeur, suffixe }) {
  const tries = [...textes].sort((a, b) => valeur(b) - valeur(a)).slice(0, 10);
  return (
    <div>
      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.05rem', marginBottom: 10 }}>{icone} {titre}</h3>
      {tries.length === 0 && <p style={{ color: '#6B6255', fontSize: '0.85rem' }}>Aucun texte pour l'instant.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tries.map((t, i) => (
          <Link
            key={t.id}
            href={`/textes/${t.id}`}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none',
              color: 'inherit', background: '#fff', border: '1px solid #DDD2BC', borderRadius: 10, padding: '9px 14px',
            }}
          >
            <span style={{ fontSize: '0.88rem' }}>
              <strong style={{ color: '#6B6255', marginRight: 6 }}>{i + 1}.</strong>
              {t.titre} <span style={{ color: '#6B6255', fontSize: '0.78rem' }}>— @{t.udc_users?.pseudo}</span>
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A5F63', flexShrink: 0 }}>
              {valeur(t)}{suffixe}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function getAuditIp(textes) {
  if (!textes || textes.length === 0) return {};
  const ids = textes.map((t) => t.id);
  const [{ data: vues }, { data: notes }] = await Promise.all([
    supabaseAdmin.from('udc_vues').select('texte_id, ip').in('texte_id', ids),
    supabaseAdmin.from('udc_notes').select('texte_id, ip').in('texte_id', ids),
  ]);

  const audit = {};
  for (const t of textes) {
    const vuesDuTexte = (vues || []).filter((v) => v.texte_id === t.id);
    const notesDuTexte = (notes || []).filter((n) => n.texte_id === t.id);
    audit[t.id] = {
      vuesTotal: vuesDuTexte.length,
      vuesIpDistinctes: new Set(vuesDuTexte.map((v) => v.ip).filter(Boolean)).size,
      notesTotal: notesDuTexte.length,
      notesIpDistinctes: new Set(notesDuTexte.map((n) => n.ip).filter(Boolean)).size,
    };
  }
  return audit;
}

export default async function ConcoursDetailPage({ params }) {
  const user = getSessionUser();
  const concours = await getConcours(params.id);
  if (!concours) notFound();

  const textes = await getTextesDuConcours(concours.id);
  const audit = user?.role === 'admin' ? await getAuditIp(textes) : {};
  const maintenant = new Date();
  const actif = new Date(concours.date_debut) <= maintenant && maintenant <= new Date(concours.date_fin);

  return (
    <>
      <HeaderNav user={user} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '5vw 6vw 8vw' }}>
        <span style={{
          display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
          borderRadius: 100, marginBottom: 10,
          background: actif ? '#3F8F5C' : '#DDD2BC', color: actif ? '#fff' : '#6B6255',
        }}>
          {actif ? '🔥 En cours' : 'Terminé'}
        </span>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>{concours.titre}</h1>
        {concours.theme && <p style={{ color: '#0A5F63', fontWeight: 700, marginTop: 6 }}>Thème : {concours.theme}</p>}
        {concours.description && <p style={{ color: '#6B6255', marginTop: 8 }}>{concours.description}</p>}
        <p style={{ fontSize: '0.82rem', color: '#6B6255', marginTop: 6 }}>
          De {new Date(concours.date_debut).toLocaleDateString('fr-FR')} à {new Date(concours.date_fin).toLocaleDateString('fr-FR')}
        </p>

        {actif && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            background: '#F8F3E8', border: '1px solid #DDD2BC', borderRadius: 14, padding: '16px 18px', marginTop: 20,
          }}>
            <div style={{ fontSize: '0.88rem' }}>
              {user ? (
                <>1. Écris ton texte · 2. Coche "Participer à ce concours" · 3. Partage-le pour gagner des points</>
              ) : (
                <>Crée un compte pour participer à ce concours.</>
              )}
            </div>
            <Link href={user ? '/ecrire' : '/inscription'} className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.85rem', flexShrink: 0 }}>
              {user ? '✍️ Participer' : 'Créer un compte'}
            </Link>
          </div>
        )}

        <BoutonsPartage
          url={`https://un-doux-un-chaud.vercel.app/concours/${concours.id}`}
          titre={concours.titre}
          style={{ marginTop: 18 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 32 }}>
          <Classement titre="Plus de lectures" icone="👁️" textes={textes} valeur={(t) => t.vues || 0} suffixe=" vues" />
          <Classement titre="Plus de commentaires" icone="💬" textes={textes} valeur={(t) => t.nbCommentaires} suffixe="" />
          <Classement titre="Plus d'étoiles" icone="⭐" textes={textes.filter((t) => t.nbNotes > 0)} valeur={(t) => Number(t.moyenneNotes.toFixed(1))} suffixe="/5" />
        </div>

        {user?.role === 'admin' && textes.length > 0 && (
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px dashed #DDD2BC' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1rem', marginBottom: 4 }}>🔍 Audit anti-triche (admin uniquement)</h3>
            <p style={{ fontSize: '0.78rem', color: '#6B6255', marginBottom: 12 }}>
              Si le nombre d'IP différentes est très inférieur au total, ça peut indiquer un gonflage artificiel.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {textes.map((t) => {
                const a = audit[t.id];
                if (!a) return null;
                const suspectVues = a.vuesTotal >= 10 && a.vuesIpDistinctes / a.vuesTotal < 0.4;
                const suspectNotes = a.notesTotal >= 5 && a.notesIpDistinctes / a.notesTotal < 0.4;
                return (
                  <div key={t.id} style={{
                    fontSize: '0.8rem', padding: '8px 12px', borderRadius: 8,
                    background: (suspectVues || suspectNotes) ? '#FBE7E4' : '#F8F3E8',
                  }}>
                    <strong>{t.titre}</strong> — vues : {a.vuesTotal} ({a.vuesIpDistinctes} IP) · notes : {a.notesTotal} ({a.notesIpDistinctes} IP)
                    {(suspectVues || suspectNotes) && <span style={{ color: '#B23A2E', fontWeight: 700 }}> ⚠️ à vérifier</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
