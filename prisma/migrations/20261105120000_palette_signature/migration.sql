-- Restaurant de démonstration : la palette « Signature » (anthracite et or du logo), la même que
-- l'espace de l'équipe ; fond et textes reviennent aux valeurs d'origine.
UPDATE "Etablissement"
SET "couleurAccent" = '#a8865a',
    "couleurBoutons" = '#1f2937',
    "couleurTitres" = '#1f2937',
    "couleurHoraires" = '#8c6d3f',
    "couleurFond" = NULL,
    "couleurTexte" = NULL
WHERE "slug" = 'chez-fatou';
