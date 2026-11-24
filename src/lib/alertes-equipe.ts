// Ce qui attend l'équipe : commandes envoyées pas encore acceptées, et appels des tables.
import "server-only";
import { bdd } from "@/lib/bdd";
import { choisirTraduction, type LangueEquipe } from "@/lib/langues";

// Interrogé toutes les 5 s par chaque poste : réponse bornée, même un soir d'affluence
const ALERTES_MAX = 50;

export type AlerteEquipe = {
  id: string;
  genre: "commande" | "serveur" | "addition";
  table: string;
  resume: string; // commande : « 2 × Yassa poulet, 1 × Bissap » dans la langue de l'équipe
};

export async function alertesEquipe(
  etablissementId: string,
  langue: LangueEquipe,
): Promise<AlerteEquipe[]> {
  const [commandes, appels] = await Promise.all([
    bdd.commande.findMany({
      where: { etablissementId, statut: "ENVOYEE", cloturee: false },
      include: { table: { select: { numero: true } }, lignes: true },
      orderBy: { creeLe: "asc" },
      take: ALERTES_MAX,
    }),
    bdd.appel.findMany({
      where: { etablissementId, traite: false },
      include: { table: { select: { numero: true } } },
      orderBy: { creeLe: "asc" },
      take: ALERTES_MAX,
    }),
  ]);

  return [
    // Les appels d'abord : un client attend quelqu'un
    ...appels.map((appel) => ({
      id: appel.id,
      genre:
        appel.type === "ADDITION"
          ? ("addition" as const)
          : ("serveur" as const),
      table: appel.table.numero,
      resume: "",
    })),
    ...commandes.map((commande) => ({
      id: commande.id,
      genre: "commande" as const,
      table: commande.table.numero,
      resume: commande.lignes
        .map(
          (ligne) =>
            `${ligne.quantite} × ${choisirTraduction(ligne.traductions as Partial<Record<string, string>>, langue, ligne.libelle)}`,
        )
        .join(", "),
    })),
  ];
}
