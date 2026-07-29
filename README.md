# UnDouxUnChaud Magazine — Projet Next.js

⚠️ IMPORTANT : ce code a été écrit sans pouvoir être testé (mon
environnement de travail n'a pas accès à internet pour faire un
`npm install` ni un `npm run build`). La structure suit les
conventions standards de Next.js 14 (App Router), mais teste-le en
local avant de déployer, il peut y avoir une coquille à corriger.

## Ce qui est fait

- Inscription (pseudo + mot de passe, email optionnel)
- Connexion / déconnexion (session par cookie signé, sans Supabase Auth)
- Page d'accueil qui affiche les vrais textes acceptés depuis Supabase
- Soumission d'un texte (API, à relier au formulaire complet du mockup HTML)
- Like (toggle) et commentaires (API)

## Ce qui reste à faire

- Relier le vrai formulaire de soumission (celui du mockup
  `udc-accueil.html`, avec image/tags/série/avertissement) à la route
  `/api/textes/submit`
- Page de lecture d'un texte (`/textes/[id]`) avec les vrais
  commentaires et le bouton like connecté
- Espace admin connecté (accepter/refuser, créer un post)
- Upload d'image réel (actuellement le champ `image_url` attend une
  URL déjà hébergée ; il faudra utiliser Supabase Storage pour
  l'upload direct depuis le formulaire)

## Installation

```bash
npm install
```

## Configuration

1. Renomme `.env.local` s'il a perdu son nom en le téléchargeant
2. Va chercher ta clé `service_role` dans Supabase > Settings > API,
   colle-la dans `.env.local` à la place de `colle_ta_cle_service_role_ici`
3. Génère un `JWT_SECRET` avec :
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   et colle le résultat dans `.env.local`

## Lancer en local

```bash
npm run dev
```

Puis ouvre http://localhost:3000

## Déploiement sur Vercel

Ajoute les 4 variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`JWT_SECRET`) dans Project Settings > Environment Variables sur
Vercel avant de déployer, sinon le site plantera au démarrage.
