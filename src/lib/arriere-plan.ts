// Travail à finir après la réponse (notification, apprentissage) : la personne n'attend pas,
// et l'hébergeur garde la fonction en vie jusqu'au bout (after() → waitUntil sur Vercel).
// Une promesse laissée « en l'air » serait, elle, interrompue dès la réponse envoyée.
import "server-only";
import { after } from "next/server";

export function enArrierePlan(nom: string, tache: () => Promise<unknown>) {
  const executer = () =>
    tache().catch((erreur) =>
      console.error(
        `[${nom}]`,
        erreur instanceof Error ? erreur.message : erreur,
      ),
    );
  try {
    after(executer);
  } catch {
    // Hors d'une requête (script, test) : exécution immédiate
    void executer();
  }
}
