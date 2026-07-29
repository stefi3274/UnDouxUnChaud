# UnDouxUnChaud Magazine — Projet Next.js

⚠️ Code non testé de mon côté (pas d'accès internet dans mon
environnement pour npm install/build). Structure standard Next.js 14
App Router. Teste en local avant de déployer.

## Pages

- `/` — accueil, textes acceptés
- `/inscription`, `/connexion` — comptes (pseudo + mot de passe)
- `/ecrire` — formulaire complet (catégorie, série/chapitre, image URL,
  avertissement de contenu, orientation HH/FF, tags, consentement)
- `/textes/[id]` — lecture, like, commentaires avec réponses et badge Auteur
- `/profil` — mes textes (statut + raison de refus), mes commentaires
- `/admin` — file d'attente (accepter/refuser avec raison)

## Rendre un compte admin

Aucune UI pour ça (volontaire). Dans Supabase → Table Editor →
`udc_users` → trouve ta ligne → change `role` de `lecteur` à `admin`.
Déconnecte-toi puis reconnecte-toi ensuite (le rôle est écrit dans le
cookie de session à la connexion, donc il faut une nouvelle connexion
pour qu'il se mette à jour).

## Pas encore fait

- Upload d'image réel (le champ attend une URL pour l'instant, pas de
  Supabase Storage branché)
- Création de post admin + génération d'image carré/story (existe en
  maquette HTML, pas encore en vrai code)

## Installation

```bash
npm install
```
Puis dans `.env.local` : coller `SUPABASE_SERVICE_ROLE_KEY` et générer
un `JWT_SECRET` :
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
```bash
npm run dev
```

## Vercel

Mêmes 4 variables d'environnement à ajouter dans Project Settings.
