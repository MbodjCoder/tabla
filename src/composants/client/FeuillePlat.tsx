"use client";

// Fiche d'un plat, ouverte d'un toucher sur son bloc : grande photo, rubrique et horaires, nom,
// description complète, prix, puis la quantité et « Ajouter » avec le total, toujours sous le pouce.
// Les textes suivent les réglages du gérant (classes .texte-*), un cran plus grands qu'en liste.
import { Clock3, Minus, Plus, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formaterPrix } from "@/lib/format";
import type { TraduireClient } from "@/lib/i18n/client";
import type { LangueClient } from "@/lib/langues";
import type { ArticleVue } from "@/lib/types";
import { texteArticle } from "./ArticleCarte";
import { FeuilleBas } from "./FeuilleBas";
import { Vignette } from "./Vignette";

export type PlatOuvert = {
  article: ArticleVue;
  rubrique: string;
  horaires: string | null;
};

const QUANTITE_MAX = 20;

export function FeuillePlat({
  plat,
  dejaCommandes,
  devise,
  langue,
  t,
  onAjouter,
  onFermer,
}: {
  plat: PlatOuvert | null;
  dejaCommandes: number; // déjà dans le panier
  devise: string;
  langue: LangueClient;
  t: TraduireClient;
  onAjouter: (quantite: number) => void;
  onFermer: () => void;
}) {
  // Le dernier plat ouvert reste affiché pendant l'animation de fermeture
  const [affiche, setAffiche] = useState(plat);
  const [quantite, setQuantite] = useState(1);
  useEffect(() => {
    if (!plat) return;
    setAffiche(plat);
    setQuantite(1);
  }, [plat]);
  if (!affiche) return null;

  const { article, rubrique, horaires } = affiche;
  const { nom, description } = texteArticle(article, langue);
  const texteDescription = description ?? article.description;

  return (
    <FeuilleBas
      ouverte={plat !== null}
      titre={nom}
      libelleFermer={t("fermer")}
      onFermer={onFermer}
      sansEnTete
      pied={
        <div className="marge-securite-bas shrink-0 border-t border-ligne/70 bg-fond px-4 pt-3">
          {article.disponible ? (
            <div className="flex items-center gap-3">
              <div className="flex h-14 shrink-0 items-center gap-1 rounded-full bg-accent-doux p-1">
                <button
                  type="button"
                  onClick={() => setQuantite((n) => Math.max(1, n - 1))}
                  disabled={quantite <= 1}
                  aria-label={`${t("retirer")} : ${nom}`}
                  className="grid size-12 place-items-center rounded-full text-bouton transition active:scale-90 disabled:opacity-35"
                >
                  <Minus className="size-5" strokeWidth={2.6} />
                </button>
                <span
                  aria-live="polite"
                  aria-label={t("quantite")}
                  className="min-w-7 text-center text-[19px] font-bold tabular-nums text-bouton"
                >
                  {quantite}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantite((n) => Math.min(QUANTITE_MAX, n + 1))
                  }
                  disabled={quantite >= QUANTITE_MAX}
                  aria-label={`${t("ajouter")} : ${nom}`}
                  className="grid size-12 place-items-center rounded-full text-bouton transition active:scale-90 disabled:opacity-35"
                >
                  <Plus className="size-5" strokeWidth={2.6} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onAjouter(quantite)}
                className="flex h-14 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-bouton ps-6 pe-5 shadow-carte transition active:scale-[0.98]"
              >
                <span className="texte-barre-commande truncate">
                  {t("ajouter")}
                </span>
                <span className="texte-barre-commande whitespace-nowrap tabular-nums">
                  {formaterPrix(article.prix * quantite, devise, langue)}
                </span>
              </button>
            </div>
          ) : (
            <p className="grid h-14 place-items-center rounded-full bg-creux text-[15px] font-semibold text-encre-pale">
              {t("articleIndisponible")}
            </p>
          )}
        </div>
      }
    >
      <div className="min-h-0 overflow-y-auto overscroll-contain px-3 pt-2 pb-5">
        {/* La photo en grand, la croix posée dessus */}
        <div className="relative overflow-hidden rounded-[26px] bg-accent-pale">
          <Vignette
            photo={article.photo}
            icone={UtensilsCrossed}
            className={`aspect-[4/3] w-full ${article.disponible ? "" : "opacity-50 grayscale"}`}
          />
          <button
            type="button"
            onClick={onFermer}
            aria-label={t("fermer")}
            className="absolute end-3 top-3 grid size-10 place-items-center rounded-full bg-white/95 text-black shadow-carte transition active:scale-90"
          >
            <X className="size-5" strokeWidth={2.4} />
          </button>
        </div>

        <div className="px-2 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-[12px] font-bold tracking-[0.14em] text-accent-profond uppercase">
              {rubrique}
            </p>
            {horaires && (
              <span className="texte-horaires flex items-center gap-1">
                <Clock3 className="size-3.5" strokeWidth={2.2} aria-hidden />
                <span dir="ltr">{horaires}</span>
              </span>
            )}
          </div>
          <h2
            className="texte-nom-plat mt-2"
            style={{ fontSize: "calc(var(--taille-nom-plat, 19px) * 1.4)" }}
          >
            {nom}
          </h2>
          <p
            className="texte-prix mt-2"
            style={{ fontSize: "calc(var(--taille-prix, 17px) * 1.25)" }}
          >
            {formaterPrix(article.prix, devise, langue)}
          </p>
          {texteDescription && (
            <p
              className="texte-description mt-4"
              style={{
                fontSize: "calc(var(--taille-description, 14px) * 1.15)",
              }}
            >
              {texteDescription}
            </p>
          )}
          {dejaCommandes > 0 && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-doux px-3.5 py-1.5 text-[13px] font-semibold text-encre">
              {t("dejaDansCommande", { n: dejaCommandes })}
            </p>
          )}
        </div>
      </div>
    </FeuilleBas>
  );
}
