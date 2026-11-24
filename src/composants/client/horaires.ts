import type { TraduireClient } from "@/lib/i18n/client";
import { FICHES_LANGUES, type LangueClient } from "@/lib/langues";

// Plage saisie par l'établissement, en français : « 7h – 10h30 », « 11h-23h »…
const PLAGE = /^(\d{1,2})\s?h(\d{2})?\s?[–-]\s?(\d{1,2})\s?h(\d{2})?$/;

const formatHeure = (langue: LangueClient) =>
  new Intl.DateTimeFormat(FICHES_LANGUES[langue].locale, {
    hour: "numeric",
    minute: "2-digit",
  });

/** Plage d'ouverture (« 24h/24 », « 7h – 10h30 ») dans la langue du client ; null pour un texte libre. */
export function plageHoraire(
  horaires: string | null,
  langue: LangueClient,
  t: TraduireClient,
): string | null {
  if (!horaires) return null;
  const principal = horaires.split(" — ")[0].trim(); // la précision après le tiret reste en français
  if (/^24\s?h\s?\/\s?24$/i.test(principal)) return t("toujours");

  const plage = PLAGE.exec(principal);
  if (!plage) return null;
  if (langue === "fr") return principal;

  const format = formatHeure(langue);
  const heure = (h: string, m = "00") =>
    format.format(new Date(2000, 0, 1, Number(h), Number(m)));
  return `${heure(plage[1], plage[2])} – ${heure(plage[3], plage[4])}`;
}

/** Horaires d'une rubrique : la plage reformatée, ou le texte libre de l'établissement en français seulement. */
export function horairesLisibles(
  horaires: string | null,
  langue: LangueClient,
  t: TraduireClient,
): string | null {
  return (
    plageHoraire(horaires, langue, t) ?? (langue === "fr" ? horaires : null)
  );
}

/** Heure « 12:00 » mise en forme selon la langue (« 12h00 » en français). */
export function heureLisible(heure: string, langue: LangueClient): string {
  const [h, m] = heure.split(":");
  if (langue === "fr") return `${Number(h)}h${m}`;
  return formatHeure(langue).format(new Date(2000, 0, 1, Number(h), Number(m)));
}
