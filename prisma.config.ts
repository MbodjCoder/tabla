// Configuration Prisma 7 : charge .env.local (Next.js) puis .env en repli.
import { config as chargerDotenv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

for (const fichier of [".env.local", ".env"]) {
  const chemin = resolve(process.cwd(), fichier);
  if (existsSync(chemin)) chargerDotenv({ path: chemin, override: false });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/semence.ts",
  },
  // Migrations par connexion directe quand elle existe (Neon : DATABASE_URL_UNPOOLED) ;
  // le pooler en mode transaction ne tient pas le verrou consultatif des migrations
  datasource: { url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"] },
});
