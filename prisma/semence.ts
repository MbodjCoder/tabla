// Données de démonstration : un restaurant fictif créé à partir du MODÈLE PAR DÉFAUT,
// exactement comme le serait un nouvel établissement client.
// Lancement : pnpm bdd:semer   (idempotent : le restaurant de démo est recréé)
import { config as chargerDotenv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { creerEtablissementDepuisModele } from "../src/lib/modele/creer-etablissement";

chargerDotenv({ path: ".env.local" });
chargerDotenv();

const bdd = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SLUG_DEMO = "chez-fatou";
// Jeton fixe de la table de démonstration : /t/demotable5
const JETON_TABLE_DEMO = "demotable5";

async function main() {
  console.info("→ Suppression du restaurant de démo existant…");
  await bdd.etablissement.deleteMany({ where: { slug: SLUG_DEMO } });

  console.info("→ Création depuis le modèle par défaut…");
  const etablissement = await creerEtablissementDepuisModele(bdd, {
    nom: "Chez Fatou",
    slug: SLUG_DEMO,
    ville: "Dakar",
    tables: [
      ...Array.from({ length: 10 }, (_, i) => ({
        numero: String(i + 1),
        zone: "Salle",
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        numero: `T${i + 1}`,
        zone: "Terrasse",
      })),
    ],
    jetonsImposes: { "5": JETON_TABLE_DEMO },
    fiche: {
      telephone: "+221 33 800 00 00",
      whatsappCommandes: "221770000000",
    },
  });

  console.info("→ Équipe…");
  // En ligne, le mot de passe de démo public est refusé : SEMENCE_MOT_DE_PASSE (16+ caractères) l'impose
  const motDePasse = process.env.SEMENCE_MOT_DE_PASSE ?? "tabla2026";
  const enLigne = !/localhost|127\.0\.0\.1/.test(
    process.env.DATABASE_URL ?? "",
  );
  if (enLigne && motDePasse.length < 16)
    throw new Error(
      "Base en ligne : définissez SEMENCE_MOT_DE_PASSE (16 caractères ou plus).",
    );
  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  await bdd.personnel.createMany({
    data: [
      {
        etablissementId: etablissement.id,
        nom: "Fatou Diop",
        email: "direction@chez-fatou.sn",
        motDePasseHash,
        role: "DIRECTION",
      },
      {
        etablissementId: etablissement.id,
        nom: "Ousmane Sarr",
        email: "service@chez-fatou.sn",
        motDePasseHash,
        role: "SERVICE",
      },
    ],
  });

  const url = process.env.URL_PUBLIQUE ?? "http://localhost:3001";
  console.info(`\n✓ Démo prête.
  Client (table 5) : ${url}/t/${JETON_TABLE_DEMO}
  Espace équipe    : ${url}/espace
    direction@chez-fatou.sn   (tout)
    service@chez-fatou.sn     (service en salle)
  Mot de passe : ${enLigne ? "celui de SEMENCE_MOT_DE_PASSE" : motDePasse}\n`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => bdd.$disconnect());
