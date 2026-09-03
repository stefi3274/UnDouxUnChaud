import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { pin, code } = await request.json();
  const saisie = code ?? pin;

  const { data: utilisateur } = await supabaseAdmin
    .from('udc_users')
    .select('lock_pin_hash')
    .eq('id', user.id)
    .maybeSingle();

  if (!utilisateur?.lock_pin_hash) {
    return NextResponse.json({ valide: false, error: 'Aucun code défini.' }, { status: 400 });
  }

  const valide = await bcrypt.compare(saisie || '', utilisateur.lock_pin_hash);
  return NextResponse.json({ valide });
}
