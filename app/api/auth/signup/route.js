import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { createSession } from '@/lib/auth';

export async function POST(request) {
  const { pseudo, motdepasse, email } = await request.json();

  if (!pseudo || !motdepasse || !email) {
    return NextResponse.json({ error: 'Pseudo, e-mail et mot de passe sont requis.' }, { status: 400 });
  }
  const emailNormalise = email.trim().toLowerCase();
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(emailNormalise)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (motdepasse.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 });
  }

  // Vérifie que le pseudo n'existe pas déjà
  const { data: pseudoExistant } = await supabaseAdmin
    .from('udc_users')
    .select('id')
    .eq('pseudo', pseudo)
    .maybeSingle();

  if (pseudoExistant) {
    return NextResponse.json({ error: 'Ce pseudo est déjà pris.' }, { status: 409 });
  }

  // Vérifie que l'e-mail n'est pas déjà utilisé (un compte par personne)
  const { data: emailExistant } = await supabaseAdmin
    .from('udc_users')
    .select('id')
    .eq('email', emailNormalise)
    .maybeSingle();

  if (emailExistant) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail.' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(motdepasse, 10);

  const { data: nouvelUtilisateur, error } = await supabaseAdmin
    .from('udc_users')
    .insert({ pseudo, password_hash, email: emailNormalise })
    .select('id, pseudo, role')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du compte.' }, { status: 500 });
  }

  createSession(nouvelUtilisateur);

  return NextResponse.json({ user: nouvelUtilisateur });
}
