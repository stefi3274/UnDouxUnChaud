import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { createSession } from '@/lib/auth';
import { verifierLimite, obtenirIp } from '@/lib/rateLimit';

export async function POST(request) {
  const { pseudo: pseudoBrut, motdepasse: motdepasseBrut, email } = await request.json();
  const pseudo = pseudoBrut?.trim();
  const motdepasse = motdepasseBrut?.trim();

  if (!pseudo || !motdepasse || !email) {
    return NextResponse.json({ error: 'Pseudo, e-mail et mot de passe sont requis.' }, { status: 400 });
  }
  if (pseudo.length < 2 || pseudo.length > 30) {
    return NextResponse.json({ error: 'Le pseudo doit faire entre 2 et 30 caractères.' }, { status: 400 });
  }
  const emailNormalise = email.trim().toLowerCase();
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(emailNormalise)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (motdepasse.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 });
  }

  const ip = obtenirIp(request);
  const { autorise } = await verifierLimite(`signup:${ip}`, 6, 60);
  if (!autorise) {
    return NextResponse.json({ error: 'Trop de comptes créés récemment depuis cette connexion. Réessaie plus tard.' }, { status: 429 });
  }

  // Vérifie que le pseudo n'existe pas déjà
  const { data: pseudoExistant } = await supabaseAdmin
    .from('udc_users')
    .select('id')
    .ilike('pseudo', pseudo)
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
