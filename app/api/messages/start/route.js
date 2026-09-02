import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Connecte-toi pour envoyer un message.' }, { status: 401 });
  }

  const { destinataire_id } = await request.json();
  if (!destinataire_id) {
    return NextResponse.json({ error: 'Destinataire manquant.' }, { status: 400 });
  }
  if (destinataire_id === user.id) {
    return NextResponse.json({ error: 'Impossible de vous envoyer un message à vous-même.' }, { status: 400 });
  }

  // Vérifie qu'aucun des deux n'a bloqué l'autre.
  const { data: blocage } = await supabaseAdmin
    .from('udc_blocks')
    .select('id')
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${destinataire_id}),and(blocker_id.eq.${destinataire_id},blocked_id.eq.${user.id})`)
    .maybeSingle();

  if (blocage) {
    return NextResponse.json({ error: "Conversation impossible avec cet utilisateur." }, { status: 403 });
  }

  // Les deux ids de la paire sont toujours stockés dans le même ordre
  // (tri alphabétique) pour éviter les doublons de conversation.
  const [user1_id, user2_id] = [user.id, destinataire_id].sort();

  const { data: existante } = await supabaseAdmin
    .from('udc_conversations')
    .select('id')
    .eq('user1_id', user1_id)
    .eq('user2_id', user2_id)
    .maybeSingle();

  if (existante) {
    return NextResponse.json({ conversationId: existante.id });
  }

  const { data: nouvelle, error } = await supabaseAdmin
    .from('udc_conversations')
    .insert({ user1_id, user2_id })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la conversation.' }, { status: 500 });
  }

  return NextResponse.json({ conversationId: nouvelle.id });
}
