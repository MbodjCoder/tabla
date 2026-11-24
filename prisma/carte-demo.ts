// Remplace la carte du restaurant de démonstration par celle du modèle (photos et traductions
// comprises), sans toucher au reste : tables, QR codes, équipe, couleurs. Les commandes passées
// gardent leurs lignes (nom et prix y sont recopiés ; le lien vers l'article est simplement retiré).
// Lancement : pnpm bdd:carte-demo   (base de .env.local ; une autre base via DATABASE_URL)
import { config as chargerDotenv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { creerCarteDepuisModele } from "../src/lib/modele/creer-etablissement";

chargerDotenv({ path: ".env.local" });
chargerDotenv();

const bdd = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SLUG_DEMO = "chez-fatou";

async function main() {
  const etablissement = await bdd.etablissement.findUniqueOrThrow({
    where: { slug: SLUG_DEMO },
  });
  await bdd.$transaction(async (transaction) => {
    // Les articles partent avec leurs rubriques (suppression en cascade)
    await transaction.categorieCatalogue.deleteMany({
      where: { etablissementId: etablissement.id },
    });
    await creerCarteDepuisModele(
      transaction as unknown as PrismaClient,
      etablissement.id,
      { aVerifier: false },
    );
  });
  const articles = await bdd.articleCatalogue.count({
    where: { etablissementId: etablissement.id },
  });
  console.info(`✓ Carte de démonstration remplacée : ${articles} articles.`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => bdd.$disconnect());
