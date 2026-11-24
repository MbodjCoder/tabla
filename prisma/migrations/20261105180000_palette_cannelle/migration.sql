-- Restaurant de démonstration : la palette « Cannelle » de la nouvelle carte (fond crème, boutons
-- et prix cannelle, textes encre) et des textes de plats nets, en Manrope, adaptés aux cartes.
UPDATE "Etablissement"
SET "couleurAccent" = '#d9a35b',
    "couleurFond" = '#fcf4e8',
    "couleurBoutons" = '#8b4513',
    "couleurTexte" = '#1c1917',
    "couleurTitres" = '#1c1917',
    "couleurHoraires" = '#8b4513',
    "typographie" = '{"nomPlat": {"police": "manrope", "taille": 18}, "prix": {"police": "manrope", "taille": 18}}'
WHERE "slug" = 'chez-fatou';
