// Polices proposées au gérant pour les textes de la carte (voir lib/typographie.ts).
// Hébergées avec l'application (aucun appel à Google côté client) et sans préchargement :
// un téléphone ne télécharge que la police réellement affichée.
import {
  Abril_Fatface,
  Archivo_Black,
  Baloo_2,
  Bebas_Neue,
  Caveat,
  Cormorant_Garamond,
  Dancing_Script,
  DM_Serif_Display,
  Fraunces,
  Fredoka,
  Great_Vibes,
  Kaushan_Script,
  Lora,
  Montserrat,
  Oswald,
  Outfit,
  Pacifico,
  Playfair_Display,
  Poppins,
  Righteous,
  Space_Grotesk,
  Special_Elite,
} from "next/font/google";

// Instrument Serif et Manrope, polices de base de l'interface, sont déclarées dans app/layout.tsx
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--police-playfair",
  preload: false,
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--police-cormorant",
  preload: false,
});
const dmserif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-dmserif",
  preload: false,
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--police-fraunces",
  preload: false,
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--police-lora",
  preload: false,
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--police-poppins",
  preload: false,
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--police-montserrat",
  preload: false,
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--police-outfit",
  preload: false,
});
const spacegrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--police-spacegrotesk",
  preload: false,
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-bebas",
  preload: false,
});
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--police-oswald",
  preload: false,
});
const abril = Abril_Fatface({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-abril",
  preload: false,
});
const archivoblack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-archivoblack",
  preload: false,
});
const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-pacifico",
  preload: false,
});
const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--police-dancing",
  preload: false,
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--police-caveat",
  preload: false,
});
const greatvibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-greatvibes",
  preload: false,
});
const kaushan = Kaushan_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-kaushan",
  preload: false,
});
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--police-fredoka",
  preload: false,
});
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--police-baloo",
  preload: false,
});
const righteous = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-righteous",
  preload: false,
});
const specialelite = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--police-specialelite",
  preload: false,
});

/** Classes à poser sur <html> : chacune définit la variable CSS --police-<id> de sa police. */
export const classesPolicesCarte = [
  playfair,
  cormorant,
  dmserif,
  fraunces,
  lora,
  poppins,
  montserrat,
  outfit,
  spacegrotesk,
  bebas,
  oswald,
  abril,
  archivoblack,
  pacifico,
  dancing,
  caveat,
  greatvibes,
  kaushan,
  fredoka,
  baloo,
  righteous,
  specialelite,
]
  .map((police) => police.variable)
  .join(" ");
