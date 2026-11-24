// Ce qui attend l'équipe, compté une seule fois par affichage (barre du haut, accueil, page ouverte) :
// nouvelles commandes à accepter, commandes en cours à servir, appels des tables, carte à valider.
import "server-only";
import { cache } from "react";
import { bdd } from "@/lib/bdd";
import type { SessionPersonnel } from "@/lib/session-personnel";

export type CompteursService = {
  nouvelles: number;
  preparation: number;
  appels: number;
  carte: number; // articles de la carte de départ à valider (direction)
};

export const compteursService = ({
  etablissementId,
  role,
}: Pick<SessionPersonnel, "etablissementId" | "role">) =>
  compter(etablissementId, role);

const compter = cache(
  async (
    etablissementId: string,
    role: SessionPersonnel["role"],
  ): Promise<CompteursService> => {
    const [nouvelles, preparation, appels, carte] = await Promise.all([
      bdd.commande.count({
        where: { etablissementId, statut: "ENVOYEE", cloturee: false },
      }),
      bdd.commande.count({
        where: { etablissementId, statut: "ACCEPTEE", cloturee: false },
      }),
      bdd.appel.count({ where: { etablissementId, traite: false } }),
      role === "DIRECTION"
        ? bdd.articleCatalogue.count({
            where: { etablissementId, aVerifier: true },
          })
        : 0,
    ]);
    return { nouvelles, preparation, appels, carte };
  },
);

/** L'établissement de l'équipe, lu une seule fois par affichage. */
export const lireEtablissement = cache((etablissementId: string) =>
  bdd.etablissement.findUniqueOrThrow({ where: { id: etablissementId } }),
);
