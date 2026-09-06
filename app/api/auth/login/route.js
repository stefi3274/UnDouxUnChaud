import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { createSession } from '@/lib/auth';
import { verifierLimite, obtenirIp } from '@/lib/rateLimit';

export async function POST(request) {
  const { pseudo, motdepasse } = await request.json();

  if (!pseudo || !motdepasse) {
    return NextResponse.json({ error: 'Pseudo et mot de passe requis.' }, { status: 400 });
  }

  const ip = obtenirIp(request);
  const { autorise } = await verifierLimite(`login:${ip}:${pseudo.trim().toLowerCase()}`, 8, 15);
  if (!autorise) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans quelques minutes.' }, { status: 429 });
  }

  const { data: utilisateur } = await supabaseAdmin
    .from('udc_users')
    .select('id, pseudo, password_hash, role')
    .ilike('pseudo', pseudo.trim())
    .maybeSingle();

  // Message volontairement générique : ne pas révéler si c'est le
  // pseudo ou le mot de passe qui est incorrect.
  if (!utilisateur) {
    return NextResponse.json({ error: 'Pseudo ou mot de passe incorrect.' }, { status: 401 });
  }

  const motDePasseValide = await bcrypt.compare(motdepasse.trim(), utilisateur.password_hash);
  if (!motDePasseValide) {
    return NextResponse.json({ error: 'Pseudo ou mot de passe incorrect.' }, { status: 401 });
  }

  const user = { id: utilisateur.id, pseudo: utilisateur.pseudo, role: utilisateur.role };
  createSession(user);

  return NextResponse.json({ user });
}
