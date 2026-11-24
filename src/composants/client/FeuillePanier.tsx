"use client";

// Le panier : quantités, précision pour la cuisine, total, et l'envoi de la commande.
import { Loader2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { formaterPrix } from "@/lib/format";
import type { TraduireClient } from "@/lib/i18n/client";
import type { LangueClient } from "@/lib/langues";
import type { ArticleVue } from "@/lib/types";
import { Quantite, texteArticle } from "./ArticleCarte";
import { FeuilleBas } from "./FeuilleBas";
import type { ErreurEnvoi, useTable } from "./useTable";
import { Vignette } from "./Vignette";

export function FeuillePanier({
  ouverte,
  lignes,
  nombre,
  total,
  devise,
  langue,
  t,
  table,
  onFermer,
  onEnvoyee,
}: {
  ouverte: boolean;
  lignes: { article: ArticleVue; quantite: number }[];
  nombre: number;
  total: number;
  devise: string;
  langue: LangueClient;
  t: TraduireClient;
  table: ReturnType<typeof useTable>;
  onFermer: () => void;
  onEnvoyee: () => void;
}) {
  const [erreur, setErreur] = useState<ErreurEnvoi | null>(null);

  const envoyer = async () => {
    setErreur(null);
    // Seules les lignes encore à la carte partent (un plat retiré entre-temps reste hors de la commande)
    const resultat = await table.envoyer(
      lignes.map(({ article, quantite }) => ({
        articleId: article.id,
        quantite,
      })),
    );
    if (resultat) setErreur(resultat);
    else onEnvoyee();
  };

  const pied = (
    <div className="marge-securite-bas shrink-0 space-y-2.5 border-t border-ligne/70 bg-fond px-5 pt-3">
      {erreur && (
        <p
          role="alert"
          className="rounded-xl bg-alerte/10 px-3.5 py-2.5 text-[13.5px] font-medium text-alerte"
        >
          {t(erreur)}
        </p>
      )}
      <button
        type="button"
        onClick={envoyer}
        disabled={table.envoiEnCours || nombre === 0}
        className="flex h-14 w-full items-center gap-3 rounded-2xl bg-bouton ps-5 pe-5 text-texte-bouton shadow-carte transition active:scale-[0.98] disabled:opacity-70"
      >
        {table.envoiEnCours && <Loader2 className="size-5 animate-spin" />}
        <span className="flex-1 text-start text-[16px] font-semibold">
          {t("envoyerCommande")}
        </span>
        <span className="text-[15px] font-semibold tabular-nums">
          {formaterPrix(total, devise, langue)}
        </span>
      </button>
      <p className="text-center text-[12.5px] text-encre-pale">
        {t("paiementServeur")}
      </p>
    </div>
  );

  return (
    <FeuilleBas
      ouverte={ouverte}
      titre={t("votreCommande")}
      sousTitre={t("articles", { n: nombre })}
      libelleFermer={t("fermer")}
      onFermer={onFermer}
      hauteur="haute"
      pied={nombre > 0 ? pied : null}
      actions={
        nombre > 0 && (
          <button
            type="button"
            onClick={table.vider}
            className="h-10 shrink-0 rounded-full px-3.5 text-[13.5px] font-semibold text-encre-douce transition hover:bg-creux"
          >
            {t("vider")}
          </button>
        )
      }
    >
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
        <ul className="divide-y divide-ligne/70">
          {lignes.map(({ article, quantite }) => {
            const { nom } = texteArticle(article, langue);
            return (
              <li key={article.id} className="flex items-center gap-3 py-3">
                <Vignette
                  photo={article.photo}
                  icone={UtensilsCrossed}
                  className="size-14 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug text-encre">
                    {nom}
                  </p>
                  <p className="text-[13px] tabular-nums text-encre-pale">
                    {formaterPrix(article.prix * quantite, devise, langue)}
                  </p>
                </div>
                <Quantite
                  quantite={quantite}
                  libelleAjouter={`${t("ajouter")} : ${nom}`}
                  libelleRetirer={`${t("retirer")} : ${nom}`}
                  onChanger={(ecart) =>
                    table.changerQuantite(article.id, ecart)
                  }
                />
              </li>
            );
          })}
        </ul>

        {nombre > 0 && (
          <label className="mt-4 block">
            <span className="text-[13.5px] font-semibold text-encre">
              {t("noteLibelle")}
            </span>
            <textarea
              value={table.note}
              onChange={(evenement) =>
                table.setNote(evenement.target.value.slice(0, 300))
              }
              placeholder={t("notePlaceholder")}
              rows={2}
              className="mt-1.5 w-full resize-none rounded-2xl border border-ligne bg-surface px-4 py-3 text-[15px] text-encre outline-none transition placeholder:text-encre-pale focus:border-bouton/50"
            />
          </label>
        )}
      </div>
    </FeuilleBas>
  );
}
