// « Appeler un serveur » et « Demander l'addition » depuis la table.
// Un seul appel en attente par table et par type : appuyer deux fois ne dérange pas deux fois.
import "server-only";
import { bdd } from "@/lib/bdd";
import type { TypeAppelVue } from "@/lib/types";

/**
 * Crée l'appel, ou renvoie celui qui attend déjà (idempotent). Deux téléphones qui appellent
 * au même instant : l'index unique partiel de la base n'en laisse passer qu'un.
 */
export async function appeler(
  etablissementId: string,
  tableId: string,
  type: TypeAppelVue,
) {
  const enAttente = () =>
    bdd.appel.findFirst({ where: { tableId, type, traite: false } });
  const existant = await enAttente();
  const appel =
    existant ??
    (await bdd.appel
      .create({ data: { etablissementId, tableId, type } })
      .catch(async (erreur: unknown) => {
        const gagnant =
          (erreur as { code?: string }).code === "P2002"
            ? await enAttente()
            : null;
        if (!gagnant) throw erreur;
        return gagnant;
      }));
  return { id: appel.id, creeLe: appel.creeLe.toISOString() };
}

/** Appels en attente d'une table : le client voit qu'on l'a entendu. */
export async function appelsEnAttente(
  tableId: string,
): Promise<TypeAppelVue[]> {
  const appels = await bdd.appel.findMany({
    where: { tableId, traite: false },
    select: { type: true },
  });
  return [...new Set(appels.map((appel) => appel.type))];
}

/** L'équipe s'est déplacée : l'appel est traité. */
export async function traiterAppel(appelId: string, etablissementId: string) {
  await bdd.appel.updateMany({
    where: { id: appelId, etablissementId, traite: false },
    data: { traite: true, traiteLe: new Date() },
  });
}
