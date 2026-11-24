// Création d'un établissement à partir du modèle par défaut : ses tables (chacune avec
// son QR code) et une carte de départ, marquée « à vérifier » pour le gérant.
// Utilisé par la semence de démonstration et, demain, par l'inscription d'un restaurant.
import { customAlphabet } from "nanoid";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ACCENT_CANNELLE, THEMES } from "@/lib/couleurs";
import { catalogueModele } from "./catalogue";

export const genererJetonQr = customAlphabet(
  "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
  12,
);

export type ParametresNouvelEtablissement = {
  nom: string;
  slug: string;
  ville: string;
  tables: { numero: string; zone?: string }[];
  couleurAccent?: string;
  fiche?: Omit<Prisma.EtablissementCreateInput, "nom" | "slug" | "ville">;
  // Jetons QR imposés (ex. table de démonstration) : { "5": "demotable5" }
  jetonsImposes?: Record<string, string>;
};

// Couleurs d'un nouvel établissement : le thème « Cannelle » de la carte modèle (fond crème,
// boutons et prix cannelle) ; le gérant les change ensuite dans Informations → Apparence
const CANNELLE = THEMES.find((theme) => theme.nom === "cannelle")!;
const COULEURS_DEPART = {
  couleurAccent: ACCENT_CANNELLE,
  couleurFond: CANNELLE.fond,
  couleurBoutons: CANNELLE.boutons,
  couleurTexte: CANNELLE.textes,
  couleurTitres: CANNELLE.titres,
  couleurHoraires: CANNELLE.horaires,
} satisfies Partial<Prisma.EtablissementCreateInput>;

export async function creerEtablissementDepuisModele(
  bdd: PrismaClient,
  parametres: ParametresNouvelEtablissement,
) {
  const { nom, slug, ville, tables, couleurAccent, fiche, jetonsImposes } =
    parametres;

  const etablissement = await bdd.etablissement.create({
    data: {
      ...COULEURS_DEPART,
      ...fiche,
      nom,
      slug,
      ville,
      ...(couleurAccent ? { couleurAccent } : {}),
      tables: {
        create: tables.map(({ numero, zone }, ordre) => ({
          numero,
          zone: zone ?? null,
          ordre,
          jetonQr: jetonsImposes?.[numero] ?? genererJetonQr(),
        })),
      },
    },
  });

  await creerCarteDepuisModele(bdd, etablissement.id, { aVerifier: true });

  return etablissement;
}

/**
 * La carte du modèle, créée pour un établissement. « À vérifier » pour un nouveau client (prix
 * indicatifs) ; validée pour la démonstration, qui la présente telle quelle.
 */
export async function creerCarteDepuisModele(
  bdd: PrismaClient,
  etablissementId: string,
  { aVerifier }: { aVerifier: boolean },
) {
  for (const [ordreCategorie, categorie] of catalogueModele().entries()) {
    await bdd.categorieCatalogue.create({
      data: {
        etablissementId,
        nom: categorie.nom,
        horaires: categorie.horaires ?? null,
        traductions: categorie.traductions,
        ordre: ordreCategorie,
        aVerifier,
        articles: {
          create: categorie.articles.map((article, ordre) => ({
            etablissementId,
            nom: article.nom,
            description: article.description,
            prix: article.prix,
            photo: article.photo,
            traductions: article.traductions,
            ordre,
            aVerifier,
          })),
        },
      },
    });
  }
}
