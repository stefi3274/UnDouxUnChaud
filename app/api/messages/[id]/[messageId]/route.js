import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

async function verifierProprietaire(messageId, userId) {
  const { data: message } = await supabaseAdmin
    .from('udc_messages')
    .select('id, sender_id, conversation_id, image_path')
    .eq('id', messageId)
    .maybeSingle();

  if (!message || message.sender_id !== userId) return null;
  return message;
}

export async function PATCH(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const message = await verifierProprietaire(params.messageId, user.id);
  if (!message) {
    return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 });
  }
  if (message.image_path) {
    return NextResponse.json({ error: 'Impossible de modifier le texte d\'une image.' }, { status: 400 });
  }

  const { contenu } = await request.json();
  if (!contenu?.trim()) {
    return NextResponse.json({ error: 'Message vide.' }, { status: 400 });
  }
  if (contenu.length > 4000) {
    return NextResponse.json({ error: 'Message trop long.' }, { status: 400 });
  }

  const { data: misAJour, error } = await supabaseAdmin
    .from('udc_messages')
    .update({ contenu: contenu.trim(), modifie_le: new Date().toISOString() })
    .eq('id', params.messageId)
    .select('id, sender_id, contenu, image_path, created_at, modifie_le, supprime, lu')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la modification.' }, { status: 500 });
  }
  return NextResponse.json({ message: misAJour });
}

export async function DELETE(request, { params }) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const message = await verifierProprietaire(params.messageId, user.id);
  if (!message) {
    return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 });
  }

  if (message.image_path) {
    await supabaseAdmin.storage.from('messages-images').remove([message.image_path]);
  }

  const { error } = await supabaseAdmin
    .from('udc_messages')
    .update({ contenu: null, image_path: null, supprime: true })
    .eq('id', params.messageId);

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
