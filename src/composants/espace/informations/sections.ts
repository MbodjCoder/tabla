// Les sections de « Informations de l'établissement », décrites une seule fois : le sommaire,
// la recherche et les formulaires en découlent. Ajouter un réglage = ajouter un champ ici
// (et sa colonne dans SCHEMAS_INFORMATIONS, app/espace/actions.ts).
import { Palette, Phone, Store, Type, type LucideIcon } from "lucide-react";
import type { SectionInformations } from "@/app/espace/actions";
import type { CleTexteEquipe, TraduireEquipe } from "@/lib/i18n/equipe";

export type DefinitionChamp = {
  nom: string;
  libelle: (t: TraduireEquipe) => string;
  type?: "text" | "tel" | "url" | "time" | "langue";
  aide?: CleTexteEquipe;
  placeholder?: CleTexteEquipe;
};

export type DefinitionSection = {
  id: SectionInformations;
  icone: LucideIcon;
  titre: (t: TraduireEquipe) => string;
  description: CleTexteEquipe;
  champs: DefinitionChamp[];
  // Termes trouvables par la recherche quand la section n'a pas de champs simples (couleurs)
  motsCles?: CleTexteEquipe[];
};

const champ = (
  nom: string,
  libelle: CleTexteEquipe,
  options: Omit<DefinitionChamp, "nom" | "libelle"> = {},
) => ({
  nom,
  libelle: (t: TraduireEquipe) => t(libelle),
  ...options,
});

export const SECTIONS: DefinitionSection[] = [
  {
    id: "identite",
    icone: Store,
    titre: (t) => t("identite"),
    description: "descIdentite",
    champs: [
      champ("nom", "nomEtablissement"),
      champ("ville", "ville"),
      champ("langueEquipe", "langueEquipe", { type: "langue" }),
    ],
  },
  {
    id: "apparence",
    icone: Palette,
    titre: (t) => t("apparence"),
    description: "descApparence",
    champs: [],
    motsCles: [
      "themesPrets",
      "couleurFond",
      "couleurBoutons",
      "couleurTexte",
      "couleurTitres",
      "couleurHoraires",
      "couleurAccent",
    ],
  },
  {
    id: "typographie",
    icone: Type,
    titre: (t) => t("typographie"),
    description: "descTypographie",
    champs: [],
    motsCles: [
      "roleRecherche",
      "roleRubriques",
      "roleTitreRubrique",
      "roleHoraires",
      "roleNomPlat",
      "roleDescription",
      "rolePrix",
      "roleBoutonAjouter",
      "roleBarreCommande",
      "styleTexte",
      "tailleTexte",
      "epaisseurTexte",
      "couleurTexteRole",
    ],
  },
  {
    id: "contacts",
    icone: Phone,
    titre: (t) => t("contacts"),
    description: "descContacts",
    champs: [
      champ("telephone", "telephone", { type: "tel" }),
      champ("whatsappCommandes", "whatsappCommandes", {
        type: "tel",
        aide: "formatNumero",
      }),
    ],
  },
];
