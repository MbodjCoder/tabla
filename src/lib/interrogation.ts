"use client";

// Interrogation régulière du serveur, pensée pour les réseaux lents ou saturés :
// jamais deux requêtes à la fois, chaque requête bornée dans le temps, un rythme qui
// ralentit après des échecs puis revient à la normale, une pause quand l'onglet est
// masqué ou hors ligne, et une reprise immédiate au retour.
import { useEffect, useEffectEvent } from "react";

// Au-delà, une requête est abandonnée : la suivante repartira sur une connexion neuve
export const DELAI_REQUETE_MS = 10 * 1000;
// Plafond du ralentissement après des échecs répétés
const INTERVALLE_MAX_MS = 60 * 1000;

/** Délai maximal d'une requête, combinable avec un autre signal d'abandon. */
export function signalDelai(delaiMs: number = DELAI_REQUETE_MS): AbortSignal {
  return AbortSignal.timeout(delaiMs);
}

/**
 * Exécute `tache` toutes les `intervalleMs` tant que `actif`. La tâche renvoie true si
 * elle a réussi ; chaque échec double l'intervalle (jusqu'à une minute).
 */
export function useInterrogation(
  tache: (signal: AbortSignal) => Promise<boolean>,
  { intervalleMs, actif = true }: { intervalleMs: number; actif?: boolean },
) {
  const executer = useEffectEvent(tache);

  useEffect(() => {
    if (!actif) return;
    let arretee = false;
    let enCours = false;
    let echecs = 0;
    let minuteur: ReturnType<typeof setTimeout> | undefined;

    const planifier = (delaiMs: number) => {
      clearTimeout(minuteur);
      minuteur = setTimeout(tourner, delaiMs);
    };
    async function tourner() {
      if (arretee || enCours) return;
      // En pause : la reprise viendra du retour sur l'onglet ou du réseau retrouvé
      if (document.hidden || !navigator.onLine) return;
      enCours = true;
      let reussie = false;
      try {
        reussie = await executer(signalDelai());
      } catch {
        reussie = false;
      }
      enCours = false;
      echecs = reussie ? 0 : echecs + 1;
      if (!arretee)
        planifier(Math.min(intervalleMs * 2 ** echecs, INTERVALLE_MAX_MS));
    }
    const reprendre = () => {
      if (!document.hidden && navigator.onLine) planifier(0);
    };

    planifier(intervalleMs);
    document.addEventListener("visibilitychange", reprendre);
    window.addEventListener("online", reprendre);
    return () => {
      arretee = true;
      clearTimeout(minuteur);
      document.removeEventListener("visibilitychange", reprendre);
      window.removeEventListener("online", reprendre);
    };
  }, [actif, intervalleMs]);
}
