import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { data: conversations, error } = await supabaseAdmin
    .from('udc_conversations')
    .select('id, user1_id, user2_id, created_at, udc_users_user1:user1_id(pseudo, avatar_path), udc_users_user2:user2_id(pseudo, avatar_path)')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erreur de chargement.' }, { status: 500 });
  }

  const { data: verrous } = await supabaseAdmin
    .from('udc_conversation_locks')
    .select('conversation_id')
    .eq('user_id', user.id);
  const idsVerrouilles = new Set((verrous || []).map((v) => v.conversation_id));

  const { data: masquees } = await supabaseAdmin
    .from('udc_conversation_hidden')
    .select('conversation_id, hidden_le')
    .eq('user_id', user.id);
  const dateMasquageParId = Object.fromEntries((masquees || []).map((m) => [m.conversation_id, m.hidden_le]));

  const resultats = await Promise.all(
    (conversations || []).map(async (c) => {
      const autrePseudo = c.user1_id === user.id ? c.udc_users_user2?.pseudo : c.udc_users_user1?.pseudo;
      const autreAvatar = c.user1_id === user.id ? c.udc_users_user2?.avatar_path : c.udc_users_user1?.avatar_path;
      const autreId = c.user1_id === user.id ? c.user2_id : c.user1_id;

      const { data: dernierMessage } = await supabaseAdmin
        .from('udc_messages')
        .select('contenu, image_path, created_at, sender_id, lu')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const dateMasquage = dateMasquageParId[c.id];
      const dateDernierMessage = dernierMessage?.created_at || c.created_at;
      if (dateMasquage && dateMasquage >= dateDernierMessage) {
        return null; // supprimée pour cette personne, et aucune nouvelle activité depuis
      }

      const { count: nonLus } = await supabaseAdmin
        .from('udc_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', c.id)
        .eq('lu', false)
        .neq('sender_id', user.id);

      return {
        id: c.id,
        autreId,
        autrePseudo,
        autreAvatar,
        dernierMessage: dernierMessage?.image_path
          ? `📷 Image${dernierMessage.contenu ? ' · ' + dernierMessage.contenu : ''}`
          : dernierMessage?.contenu || null,
        dernierMessageDate: dateDernierMessage,
        nonLus: nonLus || 0,
        verrouillee: idsVerrouilles.has(c.id),
      };
    })
  );

  const visibles = resultats.filter(Boolean);
  visibles.sort((a, b) => new Date(b.dernierMessageDate) - new Date(a.dernierMessageDate));

  return NextResponse.json({ conversations: visibles });
}
