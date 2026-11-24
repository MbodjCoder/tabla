// Cycle de vie d'une commande : envoyée par le client depuis sa table → acceptée par
// l'équipe (en préparation) → servie. Annulable par le client tant qu'elle n'est pas
// acceptée ; refusable par l'équipe. Les prix viennent toujours de la carte, jamais du client.
//
// Chaque changement d'état est une écriture conditionnelle (statut attendu) : deux appuis
// simultanés, ou deux serveurs qui agissent en même temps, n'ont jamais d'effet en double.
import "server-only";
import { enArrierePlan } from "@/lib/arriere-plan";
import { bdd } from "@/lib/bdd";
import type { ContexteTable } from "@/lib/contexte-table";
import { env } from "@/lib/env";
import { formaterPrix } from "@/lib/format";
import { traducteurEquipe } from "@/lib/i18n/equipe";
import {
  choisirTraduction,
  estLangueEquipe,
  LANGUES_CLIENT,
  type LangueClient,
} from "@/lib/langues";
import { envoyerNotification } from "@/lib/notifications/whatsapp";
import type { CommandeVue, LignePanier } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";

// Bornes d'une commande : au-delà, c'est une erreur ou un abus
export const LIGNES_MAX = 30;
export const QUANTITE_MAX = 20;
export const LONGUEUR_MAX_NOTE = 300;

const inclusionLignes = { lignes: true } satisfies Prisma.CommandeInclude;
type CommandeAvecLignes = Prisma.CommandeGetPayload<{
  include: typeof inclusionLignes;
}>;

export function versVue(commande: CommandeAvecLignes): CommandeVue {
  return {
    id: commande.id,
    numero: commande.numero,
    statut: commande.statut,
    langueClient: commande.langueClient,
    note: commande.note,
    montantTotal: commande.montantTotal,
    annuleeParClient: commande.annuleeParClient,
    creeLe: commande.creeLe.toISOString(),
    accepteeLe: commande.accepteeLe?.toISOString() ?? null,
    servieLe: commande.servieLe?.toISOString() ?? null,
    lignes: commande.lignes.map((ligne) => ({
      quantite: ligne.quantite,
      prixUnitaire: ligne.prixUnitaire,
      libelle: ligne.libelle,
      traductions: ligne.traductions as Partial<Record<string, string>>,
    })),
  };
}

export type ResultatCommande =
  | { ok: true; commande: CommandeVue }
  | {
      ok: false;
      erreur: "panierVide" | "articleInconnu" | "indisponible";
      articles?: string[];
    };

/** Commande déjà créée par ce même envoi (envoi répété après une réponse perdue). */
async function commandeDejaEnvoyee(tableId: string, cleEnvoi: string | null) {
  if (!cleEnvoi) return null;
  return bdd.commande.findUnique({
    where: { tableId_cleEnvoi: { tableId, cleEnvoi } },
    include: inclusionLignes,
  });
}

/**
 * Le client envoie son panier depuis sa table. Idempotent : le même envoi répété
 * (même clé d'envoi) renvoie la commande déjà créée, même si deux tentatives se croisent.
 */
export async function creerCommande(
  { etablissement, table }: ContexteTable,
  panier: LignePanier[],
  note: string | null,
  langueClient: LangueClient,
  cleEnvoi: string | null,
): Promise<ResultatCommande> {
  const dejaEnvoyee = await commandeDejaEnvoyee(table.id, cleEnvoi);
  if (dejaEnvoyee) return { ok: true, commande: versVue(dejaEnvoyee) };

  // Une même référence envoyée deux fois compte pour une seule ligne
  const quantites = new Map<string, number>();
  for (const { articleId, quantite } of panier) {
    quantites.set(
      articleId,
      Math.min(QUANTITE_MAX, (quantites.get(articleId) ?? 0) + quantite),
    );
  }
  if (quantites.size === 0) return { ok: false, erreur: "panierVide" };

  const articles = await bdd.articleCatalogue.findMany({
    where: {
      etablissementId: etablissement.id,
      id: { in: [...quantites.keys()] },
    },
  });
  if (articles.length !== quantites.size) {
    // Retiré de la carte entre-temps : le client sait lesquels ôter de son panier
    const connus = new Set(articles.map((article) => article.id));
    return {
      ok: false,
      erreur: "articleInconnu",
      articles: [...quantites.keys()].filter((id) => !connus.has(id)),
    };
  }
  const indisponibles = articles.filter((article) => !article.disponible);
  if (indisponibles.length > 0) {
    return {
      ok: false,
      erreur: "indisponible",
      articles: indisponibles.map((article) => article.id),
    };
  }

  const lignes = articles.map((article) => {
    const traductions = article.traductions as Partial<
      Record<string, { nom: string }>
    >;
    return {
      articleId: article.id,
      libelle: article.nom,
      quantite: quantites.get(article.id)!,
      prixUnitaire: article.prix,
      traductions: Object.fromEntries(
        LANGUES_CLIENT.filter((langue) => langue !== "fr").flatMap((langue) =>
          traductions[langue]?.nom ? [[langue, traductions[langue].nom]] : [],
        ),
      ),
    };
  });

  // Numéro lisible attribué de façon atomique, dans la même transaction que la commande
  const commande = await bdd
    .$transaction(async (tx) => {
      const { compteurCommandes } = await tx.etablissement.update({
        where: { id: etablissement.id },
        data: { compteurCommandes: { increment: 1 } },
        select: { compteurCommandes: true },
      });
      return tx.commande.create({
        data: {
          etablissementId: etablissement.id,
          tableId: table.id,
          numero: compteurCommandes,
          langueClient,
          note: note?.trim().slice(0, LONGUEUR_MAX_NOTE) || null,
          montantTotal: lignes.reduce(
            (total, ligne) => total + ligne.quantite * ligne.prixUnitaire,
            0,
          ),
          cleEnvoi,
          lignes: { create: lignes },
        },
        include: inclusionLignes,
      });
    })
    .catch(async (erreur: unknown) => {
      // Deux tentatives du même envoi se sont croisées : la première a gagné, on la renvoie
      if ((erreur as { code?: string }).code === "P2002") {
        const gagnante = await commandeDejaEnvoyee(table.id, cleEnvoi);
        if (gagnante) return { ...gagnante, dejaConnue: true as const };
      }
      throw erreur;
    });
  if ("dejaConnue" in commande)
    return { ok: true, commande: versVue(commande) };

  prevenirEquipe(etablissement, table.numero, commande);
  return { ok: true, commande: versVue(commande) };
}

/** Notification WhatsApp de la nouvelle commande (si un numéro est configuré). */
function prevenirEquipe(
  etablissement: ContexteTable["etablissement"],
  numeroTable: string,
  commande: CommandeAvecLignes,
) {
  const destinataire = etablissement.whatsappCommandes;
  if (!destinataire) return;
  const langue = estLangueEquipe(etablissement.langueEquipe)
    ? etablissement.langueEquipe
    : "fr";
  const t = traducteurEquipe(langue);
  const details = commande.lignes.map(
    (ligne) =>
      `${ligne.quantite} × ${choisirTraduction(ligne.traductions as Partial<Record<string, string>>, langue, ligne.libelle)}`,
  );
  details.push(
    `${t("total")} ${formaterPrix(commande.montantTotal, etablissement.devise, langue)}`,
  );
  if (commande.note) details.push(`${t("note")} ${commande.note}`);
  enArrierePlan("notification", () =>
    envoyerNotification({
      destinataire,
      titre: `${t("table")} ${numeroTable} · ${t("commandeNumero", { n: commande.numero })}`,
      details,
      lien: `${env.URL_PUBLIQUE}/espace/commandes`,
    }),
  );
}

/** Statut courant des commandes d'une table (suivi en direct côté client). */
export async function statutsCommandes(
  tableId: string,
  ids: string[],
): Promise<CommandeVue[]> {
  const commandes = await bdd.commande.findMany({
    where: { tableId, id: { in: ids } },
    include: inclusionLignes,
  });
  return commandes.map(versVue);
}

/** Le client annule sa commande tant que l'équipe ne l'a pas acceptée. */
export async function annulerParClient(
  tableId: string,
  commandeId: string,
): Promise<CommandeVue | null> {
  const { count } = await bdd.commande.updateMany({
    where: { id: commandeId, tableId, statut: "ENVOYEE" },
    data: { statut: "ANNULEE", annuleeParClient: true, annuleeLe: new Date() },
  });
  if (count === 0) return null;
  return versVue(
    await bdd.commande.findUniqueOrThrow({
      where: { id: commandeId },
      include: inclusionLignes,
    }),
  );
}

export type DecisionEquipe = "accepter" | "refuser" | "servir";

// Statut attendu pour chaque décision, et ce qu'elle écrit
const TRANSITIONS: Record<
  DecisionEquipe,
  {
    depuis: CommandeAvecLignes["statut"][];
    donnees: () => Prisma.CommandeUpdateManyMutationInput;
  }
> = {
  accepter: {
    depuis: ["ENVOYEE"],
    donnees: () => ({ statut: "ACCEPTEE", accepteeLe: new Date() }),
  },
  refuser: {
    depuis: ["ENVOYEE", "ACCEPTEE"],
    donnees: () => ({ statut: "ANNULEE", annuleeLe: new Date() }),
  },
  servir: {
    depuis: ["ACCEPTEE"],
    donnees: () => ({ statut: "SERVIE", servieLe: new Date() }),
  },
};

/** Décision de l'équipe : accepter, refuser ou marquer servie. */
export async function deciderCommande(
  commandeId: string,
  etablissementId: string,
  decision: DecisionEquipe,
): Promise<boolean> {
  const { depuis, donnees } = TRANSITIONS[decision];
  const { count } = await bdd.commande.updateMany({
    where: { id: commandeId, etablissementId, statut: { in: depuis } },
    data: donnees(),
  });
  return count === 1;
}

/**
 * Clients partis, addition réglée : le repas de la table est clos. Une commande jamais acceptée
 * est annulée, une commande en préparation est considérée servie ; plus rien de cette table
 * n'attend l'équipe (onglets, alertes) ni le client (suivi).
 */
export async function libererTable(tableId: string, etablissementId: string) {
  const maintenant = new Date();
  const ouvertes = { tableId, etablissementId, cloturee: false };
  await bdd.$transaction([
    bdd.commande.updateMany({
      where: { ...ouvertes, statut: "ENVOYEE" },
      data: { statut: "ANNULEE", annuleeLe: maintenant },
    }),
    bdd.commande.updateMany({
      where: { ...ouvertes, statut: "ACCEPTEE" },
      data: { statut: "SERVIE", servieLe: maintenant },
    }),
    bdd.commande.updateMany({ where: ouvertes, data: { cloturee: true } }),
    bdd.appel.updateMany({
      where: { tableId, etablissementId, traite: false },
      data: { traite: true, traiteLe: maintenant },
    }),
  ]);
}
