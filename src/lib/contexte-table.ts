// Résolution du jeton QR → établissement et table.
// Point d'entrée unique côté client : aucune donnée n'est accessible
// sans le jeton d'une table active d'un établissement actif.
import "server-only";
import { cache } from "react";
import { bdd } from "@/lib/bdd";

// Une seule lecture par requête (métadonnées et page la partagent)
export const resoudreTable = cache(async (jetonQr: string) => {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(jetonQr)) return null;

  const table = await bdd.table.findUnique({
    where: { jetonQr },
    include: { etablissement: true },
  });
  if (!table || !table.actif || !table.etablissement.actif) return null;

  const { etablissement, ...infosTable } = table;
  return { etablissement, table: infosTable };
});

export type ContexteTable = NonNullable<
  Awaited<ReturnType<typeof resoudreTable>>
>;
