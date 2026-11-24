// Limiteur de débit en mémoire (fenêtre glissante).
// Suffisant pour une instance unique ; en production multi-instances,
// remplacer par Upstash Redis (même interface).
import "server-only";
import { headers } from "next/headers";

const fenetres = new Map<string, { instants: number[]; dureeMs: number }>();

// Purge régulière des clés inactives : la mémoire reste bornée quel que soit le trafic
const INTERVALLE_PURGE_MS = 60 * 1000;
let dernierePurge = 0;

function purger(maintenant: number) {
  if (maintenant - dernierePurge < INTERVALLE_PURGE_MS) return;
  dernierePurge = maintenant;
  for (const [cle, { instants, dureeMs }] of fenetres) {
    if (maintenant - (instants.at(-1) ?? 0) >= dureeMs) fenetres.delete(cle);
  }
}

export function autoriser(
  cle: string,
  maximum: number,
  dureeMs: number,
): boolean {
  const maintenant = Date.now();
  purger(maintenant);
  const recents = (fenetres.get(cle)?.instants ?? []).filter(
    (instant) => maintenant - instant < dureeMs,
  );
  if (recents.length >= maximum) {
    fenetres.set(cle, { instants: recents, dureeMs });
    return false;
  }
  recents.push(maintenant);
  fenetres.set(cle, { instants: recents, dureeMs });
  return true;
}

/** Adresse du visiteur (derrière un proxy : premier maillon de X-Forwarded-For). */
export async function adresseClient(): Promise<string> {
  const entetes = await headers();
  return (
    entetes.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    entetes.get("x-real-ip") ||
    "inconnue"
  );
}
