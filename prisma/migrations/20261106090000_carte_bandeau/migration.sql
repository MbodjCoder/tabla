-- Restaurant de démonstration : cartes de plats en bandeau, nom et prix en Playfair Display
-- (lettres à empattements, comme sur la maquette validée).
UPDATE "Etablissement"
SET "typographie" = '{"nomPlat": {"police": "playfair", "taille": 19}, "prix": {"police": "playfair", "taille": 17}}'
WHERE "slug" = 'chez-fatou';
