import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { bio } = await request.json();
  if (bio && bio.length > 500) {
    return NextResponse.json({ error: 'La bio doit faire 500 caractères maximum.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('udc_users').update({ bio: bio?.trim() || null }).eq('id', user.id);
  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
