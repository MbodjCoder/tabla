// Client Prisma unique (adaptateur node-postgres, Prisma 7).
// En dev, conservé sur globalThis pour survivre au rechargement à chaud.
import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

declare global {
  var clientPrismaGlobal: PrismaClient | undefined;
}

// Connexion via un pooler (Neon « -pooler », PgBouncer) : paramètres de session interdits au démarrage
const viaPooler = /-pooler\.|pgbouncer=true/.test(env.DATABASE_URL);

function creerClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      // « require » vaut déjà vérification complète du certificat : on l'écrit explicitement
      connectionString: env.DATABASE_URL.replace(
        "sslmode=require",
        "sslmode=verify-full",
      ),
      max: env.BDD_CONNEXIONS_MAX,
      // Base saturée ou injoignable : erreur rapide plutôt qu'une requête suspendue
      connectionTimeoutMillis: 10 * 1000,
      idleTimeoutMillis: 30 * 1000,
      // Aucune requête ne doit bloquer une connexion du pool indéfiniment
      // (derrière un pooler, la limite est posée sur le rôle : ALTER ROLE … SET statement_timeout)
      ...(viaPooler ? {} : { statement_timeout: 15 * 1000 }),
    }),
  });
}

export const bdd = globalThis.clientPrismaGlobal ?? creerClient();

if (process.env.NODE_ENV !== "production") globalThis.clientPrismaGlobal = bdd;
