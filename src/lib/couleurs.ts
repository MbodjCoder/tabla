// Couleurs propres à chaque établissement, injectées en variables CSS (voir globals.css ;
// les variables gardent le suffixe « -hotel » hérité de Lalla).
// Partagé client / serveur : aucune dépendance.

const HEXA = /^#[0-9a-fA-F]{6}$/;

/** Accent du thème « Cannelle » : pastilles de rubriques et repères dorés. */
export const ACCENT_CANNELLE = "#d9a35b";

export const FOND_PAR_DEFAUT = "#f7f8f3";
export const TEXTE_PAR_DEFAUT = "#1a1b17";

/** Fonds clairs éprouvés, proposés en un clic dans les réglages. */
export const FONDS_SUGGERES = [
  { couleur: FOND_PAR_DEFAUT, nom: "blancCasse" },
  { couleur: "#faf6ee", nom: "ivoire" },
  { couleur: "#f3eee5", nom: "sable" },
  { couleur: "#eff4f1", nom: "sauge" },
  { couleur: "#eef3f8", nom: "brume" },
  { couleur: "#f8f0ee", nom: "rose" },
] as const;

export type ThemeCouleurs = {
  nom:
    | "cannelle"
    | "signature"
    | "classique"
    | "terre"
    | "sauge"
    | "ocean"
    | "safran"
    | "bordeaux";
  fond: string;
  boutons: string;
  textes: string;
  titres: string;
  horaires: string;
};

/** Thèmes complets et lisibles : un clic dans les réglages applique toutes les couleurs. */
export const THEMES: ThemeCouleurs[] = [
  // La carte modèle : fond crème, boutons et prix cannelle, textes encre ; chaleureux et appétissant
  {
    nom: "cannelle",
    fond: "#fcf4e8",
    boutons: "#8b4513",
    textes: "#1c1917",
    titres: "#1c1917",
    horaires: "#8b4513",
  },
  // Celui de l'espace de l'équipe et du logo : anthracite et or, sobre, qui va à tout restaurant
  {
    nom: "signature",
    fond: "#f7f8f3",
    boutons: "#1f2937",
    textes: "#1a1b17",
    titres: "#1f2937",
    horaires: "#8c6d3f",
  },
  {
    nom: "classique",
    fond: "#f7f8f3",
    boutons: "#1d4e89",
    textes: "#1a1b17",
    titres: "#1d4e89",
    horaires: "#1d4e89",
  },
  {
    nom: "terre",
    fond: "#faf6ee",
    boutons: "#a8432a",
    textes: "#2b1d16",
    titres: "#a8432a",
    horaires: "#8a3a22",
  },
  {
    nom: "sauge",
    fond: "#eff4f1",
    boutons: "#2f5d46",
    textes: "#17251d",
    titres: "#2f5d46",
    horaires: "#2f5d46",
  },
  {
    nom: "ocean",
    fond: "#eef3f8",
    boutons: "#0f4c75",
    textes: "#0f1d2b",
    titres: "#0f4c75",
    horaires: "#0f4c75",
  },
  {
    nom: "safran",
    fond: "#fbf5e6",
    boutons: "#8f5200",
    textes: "#2a2113",
    titres: "#8f5200",
    horaires: "#7a4800",
  },
  {
    nom: "bordeaux",
    fond: "#f8f0ee",
    boutons: "#7a1f2b",
    textes: "#2a1416",
    titres: "#7a1f2b",
    horaires: "#7a1f2b",
  },
];

/** Luminance relative WCAG d'une couleur « #rrggbb » (0 = noir, 1 = blanc). */
function luminance(hexa: string): number {
  const [r, g, b] = [1, 3, 5].map((debut) => {
    const canal = parseInt(hexa.slice(debut, debut + 2), 16) / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Au-dessous de ce seuil, un texte blanc contraste mieux qu'un texte encre
const SEUIL_FOND_SOMBRE = 0.36;
// Le fond reçoit des cartes blanches et du texte encre : il doit rester clair
const SEUIL_FOND_CLAIR = 0.72;
// Texte en gras sur carte blanche : contraste d'au moins 3:1 (WCAG, texte mis en avant)
const SEUIL_TEXTE_SUR_BLANC = 0.3;
// Texte courant : contraste d'au moins 4,5:1 sur blanc (WCAG AA)
const SEUIL_TEXTE_COURANT = 0.18;

/** La couleur reste-t-elle lisible en texte mis en avant (gras, titres) sur une carte blanche ? */
export function lisibleSurBlanc(couleur: string): boolean {
  return HEXA.test(couleur) && luminance(couleur) <= SEUIL_TEXTE_SUR_BLANC;
}

/** La couleur convient-elle au texte courant (noms des plats, descriptions) ? */
export function texteLisible(couleur: string): boolean {
  return HEXA.test(couleur) && luminance(couleur) <= SEUIL_TEXTE_COURANT;
}

/** Le fond est-il assez clair pour que cartes, texte et ombres restent lisibles ? */
export function fondAssezClair(couleur: string): boolean {
  return HEXA.test(couleur) && luminance(couleur) >= SEUIL_FOND_CLAIR;
}

/** Mélange de deux couleurs « #rrggbb » : part de la première, entre 0 et 1. */
function melanger(premiere: string, seconde: string, part: number): string {
  const canal = (hexa: string, debut: number) =>
    parseInt(hexa.slice(debut, debut + 2), 16);
  return `#${[1, 3, 5]
    .map((debut) =>
      Math.round(
        canal(premiere, debut) * part + canal(seconde, debut) * (1 - part),
      ),
    )
    .map((valeur) => valeur.toString(16).padStart(2, "0"))
    .join("")}`;
}

export type CouleursEtablissement = {
  couleurAccent: string;
  couleurFond?: string | null;
  couleurHoraires?: string | null;
  couleurBoutons?: string | null;
  couleurTexte?: string | null;
  couleurTitres?: string | null;
};

/** Texte lisible (blanc ou noir) sur un fond donné. */
function texteSur(fond: string) {
  return luminance(fond) < SEUIL_FOND_SOMBRE ? "#ffffff" : "#000000";
}

/**
 * Variables CSS d'un établissement : couleur d'accent, boutons (avec un texte lisible
 * calculé automatiquement), fond, textes (et leurs nuances atténuées), titres des
 * rubriques et horaires. Une couleur invalide ou illisible est ignorée.
 */
export function variablesCouleurs({
  couleurAccent,
  couleurFond,
  couleurHoraires,
  couleurBoutons,
  couleurTexte,
  couleurTitres,
}: CouleursEtablissement): Record<string, string> {
  const variables: Record<string, string> = {};
  if (HEXA.test(couleurAccent)) variables["--accent-hotel"] = couleurAccent;
  if (couleurBoutons && HEXA.test(couleurBoutons)) {
    variables["--bouton-hotel"] = couleurBoutons;
    variables["--texte-bouton-hotel"] = texteSur(couleurBoutons);
  }
  if (couleurFond && fondAssezClair(couleurFond))
    variables["--fond-hotel"] = couleurFond;
  if (couleurTexte && texteLisible(couleurTexte)) {
    variables["--texte-hotel"] = couleurTexte;
    variables["--texte-doux-hotel"] = melanger(couleurTexte, "#ffffff", 0.72);
    variables["--texte-pale-hotel"] = melanger(couleurTexte, "#ffffff", 0.5);
  }
  if (couleurTitres && lisibleSurBlanc(couleurTitres))
    variables["--titres-hotel"] = couleurTitres;
  if (couleurHoraires && lisibleSurBlanc(couleurHoraires))
    variables["--horaires-hotel"] = couleurHoraires;
  return variables;
}

/** Les mêmes variables, en déclarations CSS (posées sur :root pour couvrir toute la page). */
export function declarationsCss(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([nom, valeur]) => `${nom}:${valeur}`)
    .join(";");
}

/**
 * Espace de l'équipe : seuls la couleur de l'établissement et les
 * boutons s'appliquent ; sans couleur choisie, les boutons restent couleur encre.
 */
// Espace de l'équipe : les couleurs de Lalla, communes à tous les établissements (accent neutre,
// boutons d'action verts). La couleur de chaque établissement reste celle de sa carte client.
export const ACCENT_EQUIPE = "#3b3b3b";
export const BOUTONS_EQUIPE = "#056119";

export function variablesEspace(
  couleurAccent: string,
  couleurBoutons: string | null,
): React.CSSProperties {
  return {
    "--bouton-defaut": "#1a1b17",
    ...variablesCouleurs({ couleurAccent, couleurBoutons }),
  } as React.CSSProperties;
}
