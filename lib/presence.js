// Seuil de fraîcheur (en secondes) pour considérer un utilisateur "en ligne".
// Le heartbeat client est envoyé toutes les 45s, donc 90s laisse une marge
// confortable pour un aller-retour réseau ou un onglet en arrière-plan.
export const SEUIL_EN_LIGNE_SEC = 90;

export function estEnLigne(dernierActif) {
  if (!dernierActif) return false;
  return (Date.now() - new Date(dernierActif).getTime()) / 1000 < SEUIL_EN_LIGNE_SEC;
}
