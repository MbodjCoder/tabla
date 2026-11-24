// Polices et tailles des textes de la carte client, réglables par le gérant.
// Partagé client / serveur, sans dépendance : les fichiers de police sont déclarés dans
// lib/polices.ts (chacun expose la variable CSS --police-<id>).

export type FamillePolice =
  "elegant" | "moderne" | "affirme" | "manuscrit" | "ludique";

export type DefinitionPolice = {
  id: string;
  nom: string; // nom affiché dans les réglages
  famille: FamillePolice;
  poids: number; // graisse retenue : celle qui rend le mieux pour un nom de plat ou un prix
  variable: string; // variable CSS de la police (posée sur <html>)
};

const police = (
  id: string,
  nom: string,
  famille: FamillePolice,
  poids: number,
  variable = `--police-${id}`,
) => ({
  id,
  nom,
  famille,
  poids,
  variable,
});

/** 24 styles très variés, rangés par famille. */
export const POLICES: DefinitionPolice[] = [
  // Élégant : empattements, carte de restaurant soignée
  police("instrument", "Instrument Serif", "elegant", 400, "--police-titre"),
  police("playfair", "Playfair Display", "elegant", 700),
  police("cormorant", "Cormorant Garamond", "elegant", 700),
  police("dmserif", "DM Serif Display", "elegant", 400),
  police("fraunces", "Fraunces", "elegant", 700),
  police("lora", "Lora", "elegant", 600),
  // Moderne : sans empattements, net et très lisible
  police("manrope", "Manrope", "moderne", 800, "--police-texte"),
  police("poppins", "Poppins", "moderne", 600),
  police("montserrat", "Montserrat", "moderne", 700),
  police("outfit", "Outfit", "moderne", 600),
  police("spacegrotesk", "Space Grotesk", "moderne", 600),
  // Affirmé : caractère fort, effet affiche
  police("bebas", "Bebas Neue", "affirme", 400),
  police("oswald", "Oswald", "affirme", 600),
  police("abril", "Abril Fatface", "affirme", 400),
  police("archivoblack", "Archivo Black", "affirme", 400),
  // Manuscrit : écrit à la main, chaleureux
  police("pacifico", "Pacifico", "manuscrit", 400),
  police("dancing", "Dancing Script", "manuscrit", 700),
  police("caveat", "Caveat", "manuscrit", 700),
  police("greatvibes", "Great Vibes", "manuscrit", 400),
  police("kaushan", "Kaushan Script", "manuscrit", 400),
  // Ludique : rond, rétro, décontracté
  police("fredoka", "Fredoka", "ludique", 600),
  police("baloo", "Baloo 2", "ludique", 700),
  police("righteous", "Righteous", "ludique", 400),
  police("specialelite", "Special Elite", "ludique", 400),
];

export const FAMILLES_POLICES: FamillePolice[] = [
  "elegant",
  "moderne",
  "affirme",
  "manuscrit",
  "ludique",
];

const POLICES_PAR_ID = new Map(
  POLICES.map((definition) => [definition.id, definition]),
);

/** Les textes de l'écran du client, chacun réglable par le gérant. */
export type RoleTexte =
  | "recherche"
  | "rubriques"
  | "titreRubrique"
  | "horaires"
  | "nomPlat"
  | "description"
  | "prix"
  | "boutonAjouter"
  | "barreCommande";

export type Graisse = 400 | 600 | 800;
export const GRAISSES: Graisse[] = [400, 600, 800];

// couleur null : celle du thème (couleurs de l'établissement)
export type StyleTexte = {
  police: string;
  taille: number;
  graisse: Graisse;
  couleur: string | null;
};
export type Typographie = Record<RoleTexte, StyleTexte>;

type DefinitionRole = {
  defaut: Omit<StyleTexte, "couleur">;
  min: number;
  max: number;
};

const texte = (taille: number, graisse: Graisse, min: number, max: number) => ({
  defaut: { police: "manrope", taille, graisse },
  min,
  max,
});

/** Chaque texte : style d'origine et tailles permises (en px), dans l'ordre de l'écran. */
export const ROLES_TEXTE: Record<RoleTexte, DefinitionRole> = {
  // 16 px au moins : en dessous, l'iPhone zoome sur le champ
  recherche: texte(16, 400, 16, 20),
  rubriques: texte(15, 800, 12, 19),
  titreRubrique: texte(17, 800, 14, 28),
  horaires: texte(13, 600, 11, 17),
  nomPlat: {
    defaut: { police: "playfair", taille: 19, graisse: 800 },
    min: 15,
    max: 28,
  },
  description: texte(14, 400, 12, 18),
  prix: {
    defaut: { police: "playfair", taille: 17, graisse: 800 },
    min: 13,
    max: 24,
  },
  boutonAjouter: texte(14, 600, 12, 17),
  barreCommande: texte(16, 600, 14, 20),
};

export const ORDRE_ROLES = Object.keys(ROLES_TEXTE) as RoleTexte[];

export function definitionPolice(id: string): DefinitionPolice | undefined {
  return POLICES_PAR_ID.get(id);
}

const HEXA = /^#[0-9a-fA-F]{6}$/;

/** Style valide d'un texte : police connue, taille entière dans les bornes, graisse proposée,
 * couleur « #rrggbb » ou celle du thème ; chaque valeur invalide reprend celle d'origine. */
export function styleValide(role: RoleTexte, valeur: unknown): StyleTexte {
  const { defaut, min, max } = ROLES_TEXTE[role];
  const brut = (valeur ?? {}) as Partial<StyleTexte>;
  const taille = Number(brut.taille);
  const graisse = Number(brut.graisse) as Graisse;
  return {
    police:
      typeof brut.police === "string" && POLICES_PAR_ID.has(brut.police)
        ? brut.police
        : defaut.police,
    taille:
      Number.isInteger(taille) && taille >= min && taille <= max
        ? taille
        : defaut.taille,
    graisse: GRAISSES.includes(graisse) ? graisse : defaut.graisse,
    couleur:
      typeof brut.couleur === "string" && HEXA.test(brut.couleur)
        ? brut.couleur.toLowerCase()
        : null,
  };
}

/** Typographie lue en base (JSON libre) : chaque texte est vérifié, rien d'inconnu ne passe. */
export function lireTypographie(json: unknown): Typographie {
  const brut = (json && typeof json === "object" ? json : {}) as Record<
    string,
    unknown
  >;
  return Object.fromEntries(
    ORDRE_ROLES.map((role) => [role, styleValide(role, brut[role])]),
  ) as Typographie;
}

// Variables CSS lues par les classes .texte-<rôle> (globals.css)
export const PREFIXES: Record<RoleTexte, string> = {
  recherche: "recherche",
  rubriques: "rubriques",
  titreRubrique: "titre-rubrique",
  horaires: "horaires",
  nomPlat: "nom-plat",
  description: "description",
  prix: "prix",
  boutonAjouter: "bouton-ajouter",
  barreCommande: "barre-commande",
};

/** Variables CSS d'une typographie : police, graisse, taille et couleur (si choisie) de chaque texte. */
export function variablesTypographie(
  typographie: Typographie,
): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const role of ORDRE_ROLES) {
    const { police: id, taille, graisse, couleur } = typographie[role];
    const definition =
      POLICES_PAR_ID.get(id) ??
      POLICES_PAR_ID.get(ROLES_TEXTE[role].defaut.police)!;
    const prefixe = PREFIXES[role];
    variables[`--police-${prefixe}`] = `var(${definition.variable})`;
    variables[`--poids-${prefixe}`] = String(graisse);
    variables[`--taille-${prefixe}`] = `${taille}px`;
    if (couleur) variables[`--couleur-${prefixe}`] = couleur;
  }
  return variables;
}
