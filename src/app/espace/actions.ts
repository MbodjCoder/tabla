"use server";

// Actions de l'espace de l'équipe. Chaque action revérifie la session et
// restreint ses écritures à l'etablissementId de celle-ci.
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { traiterAppel } from "@/lib/appels";
import { bdd } from "@/lib/bdd";
import {
  deciderCommande,
  libererTable,
  type DecisionEquipe,
} from "@/lib/commandes";
import { ORDRE_ROLES, styleValide, type Typographie } from "@/lib/typographie";
import {
  FOND_PAR_DEFAUT,
  fondAssezClair,
  lisibleSurBlanc,
  TEXTE_PAR_DEFAUT,
  texteLisible,
} from "@/lib/couleurs";
import { traducteurEquipe } from "@/lib/i18n/equipe";
import { COOKIE_LANGUE_EQUIPE, lireLangueEquipe } from "@/lib/langue-equipe";
import { estLangueEquipe, LANGUES_EQUIPE } from "@/lib/langues";
import { adresseClient, autoriser } from "@/lib/limiteur";
import { genererJetonQr } from "@/lib/modele/creer-etablissement";
import {
  exigerPersonnel,
  fermerSession,
  ouvrirSession,
} from "@/lib/session-personnel";
import type { Prisma } from "@/generated/prisma/client";

// Empreinte factice : bcrypt s'exécute même pour un e-mail inconnu (temps de réponse constant)
const EMPREINTE_FACTICE =
  "$2b$10$F7KL/E62oC2oJahV5gBoQOBNTjpKENxmoRG4/rgZrsqrJeL3EWsyK";

const texte = (formulaire: FormData, cle: string) =>
  String(formulaire.get(cle) ?? "").trim();
const texteOuNull = (formulaire: FormData, cle: string) =>
  texte(formulaire, cle) || null;

async function exigerDirection() {
  const session = await exigerPersonnel();
  if (session.role !== "DIRECTION") redirect("/espace/accueil");
  return session;
}

// ─────────────────────────────────────────────────────────────
// Session et langue
// ─────────────────────────────────────────────────────────────

export type EtatConnexion = { erreur: string | null };

export async function seConnecter(
  _etat: EtatConnexion,
  formulaire: FormData,
): Promise<EtatConnexion> {
  const t = traducteurEquipe(await lireLangueEquipe());
  // Longueurs bornées : clés du limiteur et calcul bcrypt maîtrisés
  const email = texte(formulaire, "email").toLowerCase().slice(0, 254);
  const motDePasse = String(formulaire.get("motDePasse") ?? "").slice(0, 200);

  // Par compte (devinette d'un mot de passe) et par adresse (essais sur de nombreux comptes)
  const autorise =
    autoriser(`connexion:${email}`, 8, 15 * 60 * 1000) &&
    autoriser(`connexion-ip:${await adresseClient()}`, 30, 15 * 60 * 1000);
  if (!autorise) return { erreur: t("tropDeTentatives") };

  const personnel = await bdd.personnel.findUnique({ where: { email } });
  const valide = await bcrypt.compare(
    motDePasse,
    personnel?.motDePasseHash ?? EMPREINTE_FACTICE,
  );
  if (!personnel || !valide) return { erreur: t("identifiantsIncorrects") };

  await ouvrirSession({
    personnelId: personnel.id,
    etablissementId: personnel.etablissementId,
    nom: personnel.nom,
    role: personnel.role,
  });
  redirect("/espace/accueil");
}

export async function seDeconnecter() {
  await fermerSession();
  redirect("/espace/connexion");
}

export async function changerLangueEquipe(formulaire: FormData) {
  const langue = formulaire.get("langue");
  if (!estLangueEquipe(langue)) return;
  (await cookies()).set(COOKIE_LANGUE_EQUIPE, langue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────
// Commandes et appels
// ─────────────────────────────────────────────────────────────

const DECISIONS: DecisionEquipe[] = ["accepter", "refuser", "servir"];

/** Accepter, refuser ou marquer servie une commande. */
export async function deciderCommandeDepuisEspace(formulaire: FormData) {
  const { etablissementId } = await exigerPersonnel();
  const decision = texte(formulaire, "decision") as DecisionEquipe;
  if (!DECISIONS.includes(decision)) return;
  await deciderCommande(
    texte(formulaire, "commandeId"),
    etablissementId,
    decision,
  );
  revalidatePath("/espace/accueil");
}

/** Le serveur s'est rendu à la table : l'appel est traité. */
export async function traiterAppelDepuisEspace(formulaire: FormData) {
  const { etablissementId } = await exigerPersonnel();
  await traiterAppel(texte(formulaire, "appelId"), etablissementId);
  revalidatePath("/espace/accueil");
}

// ─────────────────────────────────────────────────────────────
// Tables
// ─────────────────────────────────────────────────────────────

/** Clients partis, addition réglée : la table repart à zéro. */
export async function libererTableDepuisEspace(formulaire: FormData) {
  const { etablissementId } = await exigerPersonnel();
  await libererTable(texte(formulaire, "tableId"), etablissementId);
  revalidatePath("/espace/accueil");
}

const schemaTable = z.object({
  numero: z.string().trim().min(1).max(12),
  zone: z.string().trim().max(40),
});

/** Ajoute une table (et son QR code). Un numéro déjà pris est ignoré. */
export async function ajouterTable(formulaire: FormData) {
  const { etablissementId } = await exigerDirection();
  const resultat = schemaTable.safeParse({
    numero: formulaire.get("numero"),
    zone: formulaire.get("zone") ?? "",
  });
  if (!resultat.success) return;
  const derniere = await bdd.table.findFirst({
    where: { etablissementId },
    orderBy: { ordre: "desc" },
  });
  await bdd.table
    .create({
      data: {
        etablissementId,
        numero: resultat.data.numero,
        zone: resultat.data.zone || null,
        ordre: (derniere?.ordre ?? -1) + 1,
        jetonQr: genererJetonQr(),
      },
    })
    .catch((erreur: unknown) => {
      if ((erreur as { code?: string }).code !== "P2002") throw erreur;
    });
  revalidatePath("/espace/accueil");
}

/** Retire une table : son QR code cesse de fonctionner (l'historique de ses commandes part avec elle). */
export async function supprimerTable(formulaire: FormData) {
  const { etablissementId } = await exigerDirection();
  await bdd.table.deleteMany({
    where: { id: texte(formulaire, "tableId"), etablissementId },
  });
  revalidatePath("/espace/accueil");
}

/** Régénère le QR d'une table (code photographié ou abîmé) : l'ancien cesse de fonctionner. */
export async function regenererQr(formulaire: FormData) {
  const { etablissementId } = await exigerDirection();
  await bdd.table.updateMany({
    where: { id: texte(formulaire, "tableId"), etablissementId },
    data: { jetonQr: genererJetonQr() },
  });
  revalidatePath("/espace/accueil");
}

// ─────────────────────────────────────────────────────────────
// Carte
// ─────────────────────────────────────────────────────────────

/** L'état voulu, pas « l'inverse de l'actuel » : deux gestes simultanés ne s'annulent pas. */
export async function basculerDisponibilite(formulaire: FormData) {
  const { etablissementId } = await exigerPersonnel();
  await bdd.articleCatalogue.updateMany({
    where: { id: texte(formulaire, "articleId"), etablissementId },
    data: { disponible: formulaire.get("disponible") === "oui" },
  });
  revalidatePath("/espace/accueil");
}

const schemaArticle = z.object({
  nom: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300).optional(),
  prix: z.coerce.number().int().min(0).max(10_000_000),
  // Lien https vers une image, ou photo fournie avec le modèle (/images/…)
  photo: z
    .string()
    .trim()
    .max(500)
    .regex(/^(https:\/\/\S+|\/images\/[\w\/.-]+)$/)
    .optional(),
});

export async function enregistrerArticle(formulaire: FormData) {
  const { etablissementId } = await exigerDirection();
  // Le formulaire valide déjà ces règles dans le navigateur ; une saisie contournée est ignorée
  const resultat = schemaArticle.safeParse({
    nom: formulaire.get("nom"),
    description: texte(formulaire, "description") || undefined,
    prix: formulaire.get("prix"),
    photo: texte(formulaire, "photo") || undefined,
  });
  if (!resultat.success) return;
  const donnees = resultat.data;
  const articleId = texte(formulaire, "articleId");

  if (articleId) {
    const existant = await bdd.articleCatalogue.findFirst({
      where: { id: articleId, etablissementId },
    });
    if (!existant) return;
    const texteModifie =
      existant.nom !== donnees.nom ||
      (existant.description ?? undefined) !== donnees.description;
    await bdd.articleCatalogue.update({
      where: { id: existant.id },
      data: {
        ...donnees,
        description: donnees.description ?? null,
        photo: donnees.photo ?? null,
        aVerifier: false,
        // Texte changé : les anciennes traductions sont retirées, plutôt qu'afficher un nom périmé
        ...(texteModifie ? { traductions: {} as Prisma.InputJsonValue } : {}),
      },
    });
  } else {
    const categorie = await bdd.categorieCatalogue.findFirst({
      where: { id: texte(formulaire, "categorieId"), etablissementId },
    });
    if (!categorie) return;
    const dernier = await bdd.articleCatalogue.findFirst({
      where: { categorieId: categorie.id },
      orderBy: { ordre: "desc" },
    });
    await bdd.articleCatalogue.create({
      data: {
        ...donnees,
        etablissementId,
        categorieId: categorie.id,
        ordre: (dernier?.ordre ?? -1) + 1,
      },
    });
  }
  revalidatePath("/espace/accueil");
}

export async function supprimerArticle(formulaire: FormData) {
  const { etablissementId } = await exigerDirection();
  await bdd.articleCatalogue.deleteMany({
    where: { id: texte(formulaire, "articleId"), etablissementId },
  });
  revalidatePath("/espace/accueil");
}

export async function enregistrerCategorie(formulaire: FormData) {
  const { etablissementId } = await exigerDirection();
  await bdd.categorieCatalogue.updateMany({
    where: { id: texte(formulaire, "categorieId"), etablissementId },
    data: {
      horaires: texteOuNull(formulaire, "horaires")?.slice(0, 80) ?? null,
      aVerifier: false,
    },
  });
  revalidatePath("/espace/accueil");
}

/** Valide en bloc les éléments issus du modèle par défaut. */
export async function toutValiderCarte() {
  const { etablissementId } = await exigerDirection();
  await bdd.$transaction([
    bdd.categorieCatalogue.updateMany({
      where: { etablissementId },
      data: { aVerifier: false },
    }),
    bdd.articleCatalogue.updateMany({
      where: { etablissementId },
      data: { aVerifier: false },
    }),
  ]);
  revalidatePath("/espace/accueil");
  revalidatePath("/espace/infos");
}

// ─────────────────────────────────────────────────────────────
// Informations de l'établissement : chaque section s'enregistre seule
// ─────────────────────────────────────────────────────────────

export type SectionInformations =
  "identite" | "apparence" | "typographie" | "contacts";

export type EtatInformations = {
  statut: "repos" | "enregistre" | "erreur";
  champs?: string[]; // champs refusés, signalés en rouge
  enregistreLe?: number; // distingue deux enregistrements successifs
};

const enregistre = (): EtatInformations => ({
  statut: "enregistre",
  enregistreLe: Date.now(),
});
const refuse = (champs: string[]): EtatInformations => ({
  statut: "erreur",
  champs,
});

const numeroWhatsapp = z
  .string()
  .trim()
  .transform((valeur) => valeur.replace(/[\s+().-]/g, ""))
  .refine((valeur) => valeur === "" || /^\d{8,15}$/.test(valeur));

const couleurHex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

// Sections à simples champs texte ; une valeur vide efface le champ facultatif
const SCHEMAS_INFORMATIONS = {
  identite: z.object({
    nom: z.string().trim().min(2).max(120),
    ville: z.string().trim().min(2).max(80),
    langueEquipe: z.enum(LANGUES_EQUIPE),
  }),
  contacts: z.object({
    telephone: z.string().trim().max(30),
    whatsappCommandes: numeroWhatsapp,
  }),
} as const;

export async function enregistrerInformations(
  _etat: EtatInformations,
  formulaire: FormData,
): Promise<EtatInformations> {
  const { etablissementId } = await exigerDirection();
  const section = texte(formulaire, "section") as SectionInformations;

  if (section === "apparence") {
    const resultat = await enregistrerApparence(etablissementId, formulaire);
    if (resultat) return resultat;
  } else if (section === "typographie") {
    const resultat = await enregistrerTypographie(etablissementId, formulaire);
    if (resultat) return resultat;
  } else if (section in SCHEMAS_INFORMATIONS) {
    const schema =
      SCHEMAS_INFORMATIONS[section as keyof typeof SCHEMAS_INFORMATIONS];
    const resultat = schema.safeParse(Object.fromEntries(formulaire));
    if (!resultat.success)
      return refuse(
        resultat.error.issues.map((issue) => String(issue.path[0])),
      );
    const donnees = Object.fromEntries(
      Object.entries(resultat.data).map(([cle, valeur]) => [
        cle,
        valeur || null,
      ]),
    );
    await bdd.etablissement.update({
      where: { id: etablissementId },
      data: donnees,
    });
  } else {
    return refuse([]);
  }
  revalidatePath("/espace", "layout");
  return enregistre();
}

/** Textes du client : polices du catalogue, tailles dans les bornes, graisses proposées, couleurs « #rrggbb ». */
async function enregistrerTypographie(
  etablissementId: string,
  formulaire: FormData,
): Promise<EtatInformations | null> {
  const typographie = Object.fromEntries(
    ORDRE_ROLES.map((role) => [
      role,
      {
        police: texte(formulaire, `police_${role}`),
        taille: Number(formulaire.get(`taille_${role}`)),
        graisse: Number(formulaire.get(`graisse_${role}`)),
        // vide : la couleur du thème
        couleur: texte(formulaire, `couleur_${role}`).toLowerCase() || null,
      },
    ]),
  ) as Typographie;
  // Le formulaire ne propose que des valeurs valides : toute autre valeur est refusée, pas corrigée en silence
  const invalides = ORDRE_ROLES.filter((role) => {
    const valide = styleValide(role, typographie[role]);
    return (
      valide.police !== typographie[role].police ||
      valide.taille !== typographie[role].taille ||
      valide.graisse !== typographie[role].graisse ||
      valide.couleur !== typographie[role].couleur
    );
  });
  if (invalides.length)
    return refuse(invalides.map((role) => `taille_${role}`));
  await bdd.etablissement.update({
    where: { id: etablissementId },
    data: { typographie },
  });
  return null;
}

/** Couleurs : null si tout est enregistré, sinon l'état d'erreur à afficher. */
async function enregistrerApparence(
  etablissementId: string,
  formulaire: FormData,
): Promise<EtatInformations | null> {
  const couleurAccent = couleurHex
    .safeParse(formulaire.get("couleurAccent"))
    .data?.toLowerCase();
  if (!couleurAccent) return refuse(["couleurAccent"]);
  // Case « Automatique » cochée (ou couleur invalide) : couleur par défaut
  const couleurChoisie = (champ: string) =>
    formulaire.get(`${champ}Auto`)
      ? null
      : (couleurHex.safeParse(formulaire.get(champ)).data?.toLowerCase() ??
        null);
  // Fond client : uniquement une teinte claire ; le blanc cassé par défaut n'est pas stocké
  const fondChoisi = String(
    formulaire.get("couleurFond") ?? FOND_PAR_DEFAUT,
  ).toLowerCase();
  if (!fondAssezClair(fondChoisi)) return refuse(["couleurFond"]);
  // Horaires : case « Automatique » ou teinte assez foncée pour une carte blanche
  // Horaires et titres : case « Automatique » ou teinte assez foncée pour rester lisible
  const horairesChoisis = String(
    formulaire.get("couleurHoraires") ?? "",
  ).toLowerCase();
  if (
    !formulaire.get("couleurHorairesAuto") &&
    !lisibleSurBlanc(horairesChoisis)
  )
    return refuse(["couleurHoraires"]);
  const titresChoisis = String(
    formulaire.get("couleurTitres") ?? "",
  ).toLowerCase();
  if (!formulaire.get("couleurTitresAuto") && !lisibleSurBlanc(titresChoisis))
    return refuse(["couleurTitres"]);
  // Textes : contraste du texte courant (noms des plats, descriptions)
  const texteChoisi = String(
    formulaire.get("couleurTexte") ?? "",
  ).toLowerCase();
  if (!formulaire.get("couleurTexteAuto") && !texteLisible(texteChoisi))
    return refuse(["couleurTexte"]);

  await bdd.etablissement.update({
    where: { id: etablissementId },
    data: {
      couleurAccent,
      couleurBoutons: couleurChoisie("couleurBoutons"),
      couleurFond: fondChoisi === FOND_PAR_DEFAUT ? null : fondChoisi,
      couleurHoraires: formulaire.get("couleurHorairesAuto")
        ? null
        : horairesChoisis,
      couleurTitres: formulaire.get("couleurTitresAuto") ? null : titresChoisis,
      couleurTexte:
        formulaire.get("couleurTexteAuto") || texteChoisi === TEXTE_PAR_DEFAUT
          ? null
          : texteChoisi,
    },
  });
  return null;
}
