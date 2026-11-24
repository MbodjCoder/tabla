-- Envoi de commande idempotent : un même envoi répété (réseau lent, réponse perdue)
-- retrouve la commande déjà créée.
ALTER TABLE "Commande" ADD COLUMN "cleEnvoi" TEXT;
CREATE UNIQUE INDEX "Commande_tableId_cleEnvoi_key" ON "Commande"("tableId", "cleEnvoi");

-- Un seul appel en attente par table et par type, garanti par la base (deux téléphones
-- qui appellent au même instant). Doublons éventuels : le plus ancien est gardé.
UPDATE "Appel" AS a
SET "traite" = true, "traiteLe" = now()
WHERE a."traite" = false
  AND EXISTS (
    SELECT 1 FROM "Appel" AS b
    WHERE b."tableId" = a."tableId" AND b."type" = a."type" AND b."traite" = false
      AND (b."creeLe" < a."creeLe" OR (b."creeLe" = a."creeLe" AND b."id" < a."id"))
  );
-- Index partiel, inexprimable dans schema.prisma : à retirer des migrations générées qui voudraient le supprimer
CREATE UNIQUE INDEX "Appel_un_en_attente_par_table_et_type" ON "Appel"("tableId", "type") WHERE "traite" = false;
