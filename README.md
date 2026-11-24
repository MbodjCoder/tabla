# Tabla

Commande à table par QR code, pour les restaurants et les restaurants d'hôtel.
Le client scanne le QR de sa table, parcourt la carte illustrée dans sa langue (8 langues),
envoie sa commande et la suit en direct ; l'équipe la reçoit aussitôt avec le numéro de table.

Projet dérivé de [Lalla](../lalla) (concierge IA d'hôtel), dont il reprend la carte, l'espace
de l'équipe, les alertes, les QR codes, l'internationalisation et les protections.

## Démarrage

```bash
pnpm install
pnpm bdd:demarrer          # PostgreSQL (Docker, port 5437)
pnpm prisma migrate deploy
pnpm bdd:semer             # restaurant de démonstration « Chez Fatou »
pnpm dev                   # http://localhost:3001
```

- Client (table 5) : http://localhost:3001/t/demotable5
- Équipe : http://localhost:3001/espace — `direction@chez-fatou.sn` (tout) ou `service@chez-fatou.sn`
  (service en salle), mot de passe local `tabla2026`.

## Parcours

| Client (`/t/<jeton>`) | Équipe (`/espace`) |
|---|---|
| Carte par rubriques, recherche, indisponibles grisés | **Commandes** : Nouvelles → Accepter / ✕ Refuser |
| Panier, précision pour la cuisine, envoi | En préparation → Servie |
| Suivi : Envoyée → Acceptée → Servie, annulable avant acceptation | **Appels** : serveur, addition → Fait |
| Appeler un serveur, demander l'addition | **Tables** : addition en cours, Libérer, QR (imprimer, régénérer) |
| 8 langues, changement instantané | **Carte** : disponibilité en un geste, articles, horaires |

Les prix viennent toujours de la carte (jamais du client) ; chaque changement d'état est une
écriture conditionnelle (aucun double effet) ; envois et appels sont limités en débit par table.

## Déploiement

En ligne : **https://tabla-nine.vercel.app** — Vercel (fonctions à Francfort, `fra1`) et
PostgreSQL Neon (Francfort), créé depuis Vercel (intégration Neon, offre gratuite).

- **Mettre en ligne** : `vercel deploy --prod`. La construction (`pnpm vercel-build`) génère le
  client Prisma, applique les migrations (connexion directe `DATABASE_URL_UNPOOLED`), puis compile.
- **Variables** (projet Vercel) : `DATABASE_URL` (poolée) et `DATABASE_URL_UNPOOLED` (fournies par
  Neon), `SECRET_SESSION`, `URL_PUBLIQUE`, `BDD_CONNEXIONS_MAX`, et facultativement `WHATSAPP_*`.
  Jamais dans le code. ⚠ `vercel integration add neon` réécrit `.env.local` avec la base en ligne :
  ses identifiants sont gardés à part dans `.env.neon` (ignoré par Git et par Vercel).
- **Limite de durée des requêtes** : posée sur le rôle de la base (`ALTER ROLE … SET statement_timeout = '15s'`),
  le pooler refusant ce paramètre à la connexion.
- **Démo en ligne** : `SEMENCE_MOT_DE_PASSE=… pnpm bdd:semer` avec `DATABASE_URL` pointée sur la base en
  ligne ; le mot de passe de démo local est refusé sur une base en ligne. Identifiants : `.env.identifiants`
  (local, ignoré par Git).
- **Index partiel** `Appel_un_en_attente_par_table_et_type` (un seul appel en attente par table et par type) :
  inexprimable dans `schema.prisma`, à retirer de toute migration générée qui voudrait le supprimer.

## Réseau lent

Pensé pour un réseau saturé : un envoi de commande répété (réponse perdue, nouvel essai, page rechargée)
retrouve la commande déjà créée grâce à sa clé d'envoi ; chaque requête est bornée dans le temps ;
le suivi et les alertes de l'équipe ne lancent jamais deux requêtes à la fois et ralentissent quand le
réseau peine. Photos en vignettes de 280 px mises en cache, polices non préchargées sauf Manrope :
environ 430 Ko à la première visite, 11 Ko ensuite.
