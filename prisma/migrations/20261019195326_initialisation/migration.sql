-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('ENVOYEE', 'ACCEPTEE', 'SERVIE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeAppel" AS ENUM ('SERVEUR', 'ADDITION');

-- CreateEnum
CREATE TYPE "RolePersonnel" AS ENUM ('DIRECTION', 'SERVICE');

-- CreateTable
CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "couleurAccent" TEXT NOT NULL DEFAULT '#6f7d5c',
    "couleurFond" TEXT,
    "couleurHoraires" TEXT,
    "couleurBoutons" TEXT,
    "langueEquipe" TEXT NOT NULL DEFAULT 'fr',
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "fuseauHoraire" TEXT NOT NULL DEFAULT 'Africa/Dakar',
    "telephone" TEXT,
    "whatsappCommandes" TEXT,
    "compteurCommandes" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Etablissement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "zone" TEXT,
    "jetonQr" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorieCatalogue" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "horaires" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "traductions" JSONB NOT NULL DEFAULT '{}',
    "aVerifier" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CategorieCatalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCatalogue" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix" INTEGER NOT NULL,
    "photo" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "traductions" JSONB NOT NULL DEFAULT '{}',
    "aVerifier" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArticleCatalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'ENVOYEE',
    "langueClient" TEXT NOT NULL DEFAULT 'fr',
    "note" TEXT,
    "montantTotal" INTEGER NOT NULL,
    "cloturee" BOOLEAN NOT NULL DEFAULT false,
    "annuleeParClient" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepteeLe" TIMESTAMP(3),
    "servieLe" TIMESTAMP(3),
    "annuleeLe" TIMESTAMP(3),

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneCommande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "articleId" TEXT,
    "libelle" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" INTEGER NOT NULL,
    "traductions" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "LigneCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appel" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "type" "TypeAppel" NOT NULL,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traiteLe" TIMESTAMP(3),

    CONSTRAINT "Appel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "role" "RolePersonnel" NOT NULL DEFAULT 'SERVICE',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Etablissement_slug_key" ON "Etablissement"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Table_jetonQr_key" ON "Table"("jetonQr");

-- CreateIndex
CREATE UNIQUE INDEX "Table_etablissementId_numero_key" ON "Table"("etablissementId", "numero");

-- CreateIndex
CREATE INDEX "CategorieCatalogue_etablissementId_idx" ON "CategorieCatalogue"("etablissementId");

-- CreateIndex
CREATE INDEX "ArticleCatalogue_etablissementId_disponible_idx" ON "ArticleCatalogue"("etablissementId", "disponible");

-- CreateIndex
CREATE INDEX "Commande_etablissementId_statut_creeLe_idx" ON "Commande"("etablissementId", "statut", "creeLe");

-- CreateIndex
CREATE INDEX "Commande_tableId_cloturee_idx" ON "Commande"("tableId", "cloturee");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_etablissementId_numero_key" ON "Commande"("etablissementId", "numero");

-- CreateIndex
CREATE INDEX "Appel_etablissementId_traite_idx" ON "Appel"("etablissementId", "traite");

-- CreateIndex
CREATE INDEX "Appel_tableId_type_traite_idx" ON "Appel"("tableId", "type", "traite");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_email_key" ON "Personnel"("email");

-- CreateIndex
CREATE INDEX "Personnel_etablissementId_idx" ON "Personnel"("etablissementId");

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorieCatalogue" ADD CONSTRAINT "CategorieCatalogue_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCatalogue" ADD CONSTRAINT "ArticleCatalogue_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCatalogue" ADD CONSTRAINT "ArticleCatalogue_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "CategorieCatalogue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "ArticleCatalogue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appel" ADD CONSTRAINT "Appel_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appel" ADD CONSTRAINT "Appel_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnel" ADD CONSTRAINT "Personnel_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
