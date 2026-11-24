// Langues prises en charge. Partagé client / serveur.

export const LANGUES_CLIENT = [
  "fr",
  "en",
  "wo",
  "es",
  "it",
  "de",
  "pt",
  "ar",
] as const;
export type LangueClient = (typeof LANGUES_CLIENT)[number];

// L'équipe dispose des mêmes langues que les clients
export const LANGUES_EQUIPE = LANGUES_CLIENT;
export type LangueEquipe = LangueClient;

export const LANGUE_PAR_DEFAUT: LangueClient = "fr";

type FicheLangue = {
  nomNatif: string; // affiché dans le sélecteur
  nomFrancais: string; // consignes au modèle
  nomAnglais: string;
  locale: string; // formatage des nombres et dates
  sens: "ltr" | "rtl";
};

export const FICHES_LANGUES: Record<LangueClient, FicheLangue> = {
  fr: {
    nomNatif: "Français",
    nomFrancais: "français",
    nomAnglais: "French",
    locale: "fr-FR",
    sens: "ltr",
  },
  en: {
    nomNatif: "English",
    nomFrancais: "anglais",
    nomAnglais: "English",
    locale: "en-GB",
    sens: "ltr",
  },
  wo: {
    nomNatif: "Wolof",
    nomFrancais: "wolof",
    nomAnglais: "Wolof",
    locale: "fr-SN",
    sens: "ltr",
  },
  es: {
    nomNatif: "Español",
    nomFrancais: "espagnol",
    nomAnglais: "Spanish",
    locale: "es-ES",
    sens: "ltr",
  },
  it: {
    nomNatif: "Italiano",
    nomFrancais: "italien",
    nomAnglais: "Italian",
    locale: "it-IT",
    sens: "ltr",
  },
  de: {
    nomNatif: "Deutsch",
    nomFrancais: "allemand",
    nomAnglais: "German",
    locale: "de-DE",
    sens: "ltr",
  },
  pt: {
    nomNatif: "Português",
    nomFrancais: "portugais",
    nomAnglais: "Portuguese",
    locale: "pt-PT",
    sens: "ltr",
  },
  ar: {
    nomNatif: "العربية",
    nomFrancais: "arabe",
    nomAnglais: "Arabic",
    locale: "ar-u-nu-latn",
    sens: "rtl",
  },
};

export function estLangueClient(valeur: unknown): valeur is LangueClient {
  return LANGUES_CLIENT.includes(valeur as LangueClient);
}

export function estLangueEquipe(valeur: unknown): valeur is LangueEquipe {
  return LANGUES_EQUIPE.includes(valeur as LangueEquipe);
}

// Langue de repli quand une traduction manque : un client wolophone ou
// maghrébin lit plus volontiers le français, un Européen l'anglais.
const REPLI: Record<LangueClient, "fr" | "en"> = {
  fr: "fr",
  en: "fr",
  wo: "fr",
  ar: "fr",
  es: "en",
  it: "en",
  de: "en",
  pt: "en",
};

/** Texte traduit avec repli : langue demandée → langue de repli → français (source). */
export function choisirTraduction<T>(
  traductions: Partial<Record<string, T>> | null | undefined,
  langue: string,
  source: T,
): T {
  if (langue === "fr" || !estLangueClient(langue)) return source;
  const repli = REPLI[langue];
  return (
    traductions?.[langue] ??
    (repli === "en" ? traductions?.en : undefined) ??
    source
  );
}

/** Nom d'une langue dans la langue de l'interface (« anglais », « inglés », « Englisch »…). */
export function nomDeLangue(
  code: LangueClient,
  langueAffichage: LangueClient,
): string {
  try {
    return (
      new Intl.DisplayNames([FICHES_LANGUES[langueAffichage].locale], {
        type: "language",
      }).of(code) ?? FICHES_LANGUES[code].nomNatif
    );
  } catch {
    return FICHES_LANGUES[code].nomNatif;
  }
}
