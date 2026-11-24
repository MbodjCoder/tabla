// Utilitaires de formatage partagés (serveur et client).
import { estLangueClient, FICHES_LANGUES } from "@/lib/langues";

/** 4500 → « 4 500 FCFA » (le franc CFA n'a pas de décimales). */
export function formaterPrix(
  montant: number,
  devise = "XOF",
  langue = "fr",
): string {
  const locale = estLangueClient(langue)
    ? FICHES_LANGUES[langue].locale
    : "fr-FR";
  const nombre = new Intl.NumberFormat(locale).format(montant);
  return devise === "XOF" ? `${nombre} FCFA` : `${nombre} ${devise}`;
}

/** Texte comparable pour la recherche : sans accents ni majuscules (« Réception » → « reception »). */
export const sansAccents = (texte: string) =>
  texte.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
