"use client";

// Un plat de la carte, en bandeau : la photo à gauche se fond dans la carte crème (motif discret
// au fond), le nom et le prix en lettres à empattements, la description, et « Ajouter + » ;
// une fois ajouté, le compteur − n + prend sa place. Un toucher ailleurs sur le bloc ouvre la fiche
// du plat. Un article indisponible reste visible, grisé.
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { formaterPrix } from "@/lib/format";
import type { TraduireClient } from "@/lib/i18n/client";
import { choisirTraduction, type LangueClient } from "@/lib/langues";
import type { ArticleVue } from "@/lib/types";
import { Vignette } from "./Vignette";

export function texteArticle(article: ArticleVue, langue: LangueClient) {
  return choisirTraduction(article.traductions, langue, {
    nom: article.nom,
    description: article.description ?? undefined,
  });
}

export function ArticleCarte({
  article,
  quantite,
  devise,
  langue,
  t,
  onChanger,
  onOuvrir,
}: {
  article: ArticleVue;
  quantite: number;
  devise: string;
  langue: LangueClient;
  t: TraduireClient;
  onChanger: (ecart: number) => void;
  onOuvrir: () => void;
}) {
  const traduction = texteArticle(article, langue);
  const description = traduction.description ?? article.description;
  return (
    <li className="carte-plat relative isolate flex min-h-[156px] overflow-hidden rounded-[22px] shadow-[0_1px_2px_rgb(60_40_20/0.06),0_14px_30px_-18px_rgb(60_40_20/0.38)]">
      {/* La photo, sur toute la hauteur, qui se fond dans la carte vers le texte */}
      <div className="absolute inset-y-0 start-0 -z-10 w-[37%]">
        <Vignette
          photo={article.photo}
          icone={UtensilsCrossed}
          className={`size-full ${article.disponible ? "" : "opacity-45 grayscale"}`}
        />
        <span
          aria-hidden
          className="fondu-photo absolute inset-y-0 end-0 w-[34%]"
        />
      </div>
      <Motif />
      {/* Tout le bloc ouvre la fiche du plat ; seuls « Ajouter » et le compteur restent à part */}
      <button
        type="button"
        onClick={onOuvrir}
        aria-label={`${t("voirPlat")} : ${traduction.nom}`}
        className="absolute inset-0 rounded-[22px] transition active:bg-black/[0.03]"
      />

      <div
        className={`pointer-events-none relative ms-[37%] flex min-w-0 flex-1 flex-col py-4 ps-4 pe-3 ${article.disponible ? "" : "opacity-55"}`}
      >
        <p className="texte-nom-plat">{traduction.nom}</p>
        {description && (
          <p className="texte-description mt-1.5 line-clamp-2">{description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pt-3">
          <span className="texte-prix whitespace-nowrap">
            {formaterPrix(article.prix, devise, langue)}
          </span>
          {!article.disponible ? (
            <span className="text-[12px] font-semibold text-encre-pale">
              {t("articleIndisponible")}
            </span>
          ) : quantite === 0 ? (
            <button
              type="button"
              onClick={() => onChanger(1)}
              aria-label={`${t("ajouter")} : ${traduction.nom}`}
              className="texte-bouton-ajouter pointer-events-auto flex h-8 shrink-0 items-center gap-1 rounded-full bg-bouton ps-3 pe-2.5 shadow-carte transition active:scale-95"
            >
              {t("ajouter")}
              <Plus className="size-3.5" strokeWidth={2.8} aria-hidden />
            </button>
          ) : (
            <Quantite
              quantite={quantite}
              libelleAjouter={`${t("ajouter")} : ${traduction.nom}`}
              libelleRetirer={`${t("retirer")} : ${traduction.nom}`}
              onChanger={onChanger}
            />
          )}
        </div>
      </div>
    </li>
  );
}

/** Treillis de losanges très pâle au fond de la carte, côté texte (décor, couleur d'accent). */
function Motif() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-y-0 end-0 -z-20 h-full w-[60%] text-accent opacity-[0.13]"
    >
      <defs>
        <pattern
          id="motif-losanges"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M11 1 21 11 11 21 1 11Z M11 7 15 11 11 15 7 11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#motif-losanges)" />
    </svg>
  );
}

export function Quantite({
  quantite,
  libelleAjouter,
  libelleRetirer,
  onChanger,
}: {
  quantite: number;
  libelleAjouter: string;
  libelleRetirer: string;
  onChanger: (ecart: number) => void;
}) {
  const boutonAjouter = (
    <button
      type="button"
      onClick={() => onChanger(1)}
      aria-label={libelleAjouter}
      className="grid size-8 place-items-center rounded-full bg-bouton text-texte-bouton shadow-carte transition active:scale-90"
    >
      <Plus className="size-4" strokeWidth={2.6} />
    </button>
  );
  if (quantite === 0) return boutonAjouter;

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-accent-doux p-0.5">
      <button
        type="button"
        onClick={() => onChanger(-1)}
        aria-label={libelleRetirer}
        className="grid size-7 place-items-center rounded-full text-bouton transition active:scale-90 active:bg-bouton/15"
      >
        <Minus className="size-4" strokeWidth={2.4} />
      </button>
      <span
        aria-live="polite"
        className="min-w-5 text-center text-[15px] font-bold tabular-nums text-bouton"
      >
        {quantite}
      </span>
      {boutonAjouter}
    </div>
  );
}
