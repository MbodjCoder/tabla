// Langue de l'interface de l'équipe : choix mémorisé sur l'appareil (cookie),
// sinon la langue définie pour l'établissement, sinon le français.
import "server-only";
import { cookies } from "next/headers";
import { traducteurEquipe } from "@/lib/i18n/equipe";
import { estLangueEquipe, type LangueEquipe } from "@/lib/langues";

export const COOKIE_LANGUE_EQUIPE = "tabla_langue_equipe";

export async function lireLangueEquipe(
  langueEtablissement?: string | null,
): Promise<LangueEquipe> {
  const choisie = (await cookies()).get(COOKIE_LANGUE_EQUIPE)?.value;
  if (estLangueEquipe(choisie)) return choisie;
  return estLangueEquipe(langueEtablissement) ? langueEtablissement : "fr";
}

export async function traducteurEquipeCourant(
  langueEtablissement?: string | null,
) {
  const langue = await lireLangueEquipe(langueEtablissement);
  return { langue, t: traducteurEquipe(langue) };
}
