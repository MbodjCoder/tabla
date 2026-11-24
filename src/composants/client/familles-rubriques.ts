// Les trois familles du bandeau de la carte : plats, boissons, desserts. Chaque rubrique du
// gérant y est rangée d'après son nom français (langue source) : il n'a rien à choisir.
import { CakeSlice, CupSoda, type LucideIcon, Utensils } from "lucide-react";
import { sansAccents } from "@/lib/format";

export type FamilleRubrique = "plats" | "boissons" | "desserts";

export const FAMILLES: { famille: FamilleRubrique; icone: LucideIcon }[] = [
  { famille: "plats", icone: Utensils },
  { famille: "boissons", icone: CupSoda },
  { famille: "desserts", icone: CakeSlice },
];

// Le petit-déjeuner reste avec les plats, même s'il propose du café
const BOISSONS =
  /^(?!.*petit.?dej).*(boisson|jus|smoothie|cocktail|biere|vin\b|vins\b|cave|soda|eau|cafe|the\b|bar\b)/;
const DESSERTS = /dessert|gateau|glace|patisser|sucre/;

export function familleRubrique(nom: string): FamilleRubrique {
  const texte = sansAccents(nom);
  if (DESSERTS.test(texte)) return "desserts";
  if (BOISSONS.test(texte)) return "boissons";
  return "plats";
}
