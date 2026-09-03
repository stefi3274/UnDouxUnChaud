import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const PIN_REGEX = /^\d{4}$/;

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { code, type, ancien_code } = await request.json();

  if (type !== 'pin' && type !== 'password') {
    return NextResponse.json({ error: 'Type de verrouillage invalide.' }, { status: 400 });
  }
  if (type === 'pin' && !PIN_REGEX.test(code || '')) {
    return NextResponse.json({ error: 'Le code PIN doit contenir exactement 4 chiffres.' }, { status: 400 });
  }
  if (type === 'password' && (!code || code.length < 6)) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères.' }, { status: 400 });
  }

  const { data: utilisateur } = await supabaseAdmin
    .from('udc_users')
    .select('lock_pin_hash')
    .eq('id', user.id)
    .maybeSingle();

  if (utilisateur?.lock_pin_hash) {
    const correspond = ancien_code && await bcrypt.compare(ancien_code, utilisateur.lock_pin_hash);
    if (!correspond) {
      return NextResponse.json({ error: 'Code/mot de passe actuel incorrect.' }, { status: 403 });
    }
  }

  const lock_pin_hash = await bcrypt.hash(code, 10);
  await supabaseAdmin.from('udc_users').update({ lock_pin_hash, lock_type: type }).eq('id', user.id);

  return NextResponse.json({ ok: true });
}
