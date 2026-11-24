-- Tables déjà libérées : leurs commandes encore en attente sortent du service, comme le fait
-- désormais la libération (jamais acceptée → annulée ; en préparation → servie).
UPDATE "Commande" SET "statut" = 'ANNULEE', "annuleeLe" = now() WHERE "cloturee" = true AND "statut" = 'ENVOYEE';
UPDATE "Commande" SET "statut" = 'SERVIE', "servieLe" = now() WHERE "cloturee" = true AND "statut" = 'ACCEPTEE';
