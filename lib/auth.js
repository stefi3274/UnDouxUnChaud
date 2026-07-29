import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'udc_session';
const SEVEN_DAYS = 60 * 60 * 24 * 7;

// Crée un token signé contenant l'id, le pseudo et le rôle de l'utilisateur,
// et le pose dans un cookie httpOnly (invisible et inaccessible en JS côté client).
export function createSession(user) {
  const token = jwt.sign(
    { id: user.id, pseudo: user.pseudo, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS,
    path: '/',
  });
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

// À appeler dans une route API pour savoir qui fait la requête.
// Retourne null si personne n'est connecté ou si le token est invalide/expiré.
export function getSessionUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
