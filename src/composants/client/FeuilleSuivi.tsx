"use client";

// Suivi des commandes de la table (celles envoyées depuis cet appareil) :
// Envoyée → Acceptée → Servie, avec l'annulation tant que l'équipe n'a pas accepté.
import { X } from "lucide-react";
import { useState } from "react";
import { formaterPrix } from "@/lib/format";
import type { TraduireClient } from "@/lib/i18n/client";
import {
  choisirTraduction,
  FICHES_LANGUES,
  type LangueClient,
} from "@/lib/langues";
import type { CommandeVue } from "@/lib/types";
import { FeuilleBas } from "./FeuilleBas";

const ETAPES = ["ENVOYEE", "ACCEPTEE", "SERVIE"] as const;

export function FeuilleSuivi({
  ouverte,
  commandes,
  devise,
  langue,
  t,
  onAnnuler,
  onFermer,
}: {
  ouverte: boolean;
  commandes: CommandeVue[];
  devise: string;
  langue: LangueClient;
  t: TraduireClient;
  onAnnuler: (id: string) => Promise<boolean>;
  onFermer: () => void;
}) {
  return (
    <FeuilleBas
      ouverte={ouverte}
      titre={t("mesCommandes")}
      libelleFermer={t("fermer")}
      onFermer={onFermer}
      hauteur="haute"
      depuisLeHaut
    >
      <ul className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-2">
        {commandes.map((commande) => (
          <CarteCommande
            key={commande.id}
            commande={commande}
            devise={devise}
            langue={langue}
            t={t}
            onAnnuler={onAnnuler}
          />
        ))}
      </ul>
    </FeuilleBas>
  );
}

function CarteCommande({
  commande,
  devise,
  langue,
  t,
  onAnnuler,
}: {
  commande: CommandeVue;
  devise: string;
  langue: LangueClient;
  t: TraduireClient;
  onAnnuler: (id: string) => Promise<boolean>;
}) {
  const [confirmation, setConfirmation] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const annulee = commande.statut === "ANNULEE";
  const etape = ETAPES.indexOf(commande.statut as (typeof ETAPES)[number]);
  const heure = new Intl.DateTimeFormat(FICHES_LANGUES[langue].locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(commande.creeLe));

  return (
    <li
      className={`rounded-[22px] border border-ligne bg-surface p-4 shadow-carte ${annulee ? "opacity-70" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-serif text-[22px] leading-none text-encre">
          {t("commandeNumero", { n: commande.numero })}
        </p>
        <span className="text-[12.5px] tabular-nums text-encre-pale">
          {heure}
        </span>
      </div>

      {/* Les trois étapes ; une commande annulée le dit simplement */}
      {annulee ? (
        <p className="mt-3 rounded-xl bg-alerte/8 px-3 py-2.5 text-[13.5px] font-medium text-alerte">
          {commande.annuleeParClient ? t("statut_ANNULEE") : t("refuseeEquipe")}
        </p>
      ) : (
        <>
          <ol
            className="mt-3.5 grid grid-cols-3 gap-1.5"
            aria-label={t(`statut_${commande.statut}`)}
          >
            {ETAPES.map((nom, rang) => (
              <li
                key={nom}
                className={`h-1.5 rounded-full ${rang <= etape ? (etape === 2 ? "bg-succes" : "bg-bouton") : "bg-creux"}`}
              />
            ))}
          </ol>
          <p
            className={`mt-2 text-[14px] font-semibold ${etape === 2 ? "text-succes" : "text-encre"}`}
          >
            {t(`statut_${commande.statut}`)}
          </p>
        </>
      )}

      <ul className="mt-3 space-y-1 border-t border-ligne/70 pt-3 text-[14px] text-encre">
        {commande.lignes.map((ligne, rang) => (
          <li key={rang} className="flex justify-between gap-3">
            <span>
              <span className="font-semibold tabular-nums">
                {ligne.quantite} ×
              </span>{" "}
              {choisirTraduction(ligne.traductions, langue, ligne.libelle)}
            </span>
            <span className="shrink-0 tabular-nums text-encre-douce">
              {formaterPrix(
                ligne.quantite * ligne.prixUnitaire,
                devise,
                langue,
              )}
            </span>
          </li>
        ))}
      </ul>
      {commande.note && (
        <p className="mt-2 text-[13px] italic text-encre-douce">
          « {commande.note} »
        </p>
      )}
      <p className="mt-2.5 flex justify-between border-t border-ligne/70 pt-2.5 text-[14.5px] font-bold text-encre">
        <span>{t("total")}</span>
        <span className="tabular-nums">
          {formaterPrix(commande.montantTotal, devise, langue)}
        </span>
      </p>

      {/* Annulable tant que l'équipe ne l'a pas acceptée, avec confirmation */}
      {commande.statut === "ENVOYEE" &&
        (confirmation ? (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-creux px-3 py-2">
            <span className="text-[13.5px] font-semibold text-encre">
              {t("confirmerAnnulation")}
            </span>
            <span className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                className="h-9 rounded-lg px-3 text-[13.5px] font-semibold text-encre-douce"
              >
                {t("garder")}
              </button>
              <button
                type="button"
                disabled={enCours}
                onClick={async () => {
                  setEnCours(true);
                  await onAnnuler(commande.id);
                  setEnCours(false);
                  setConfirmation(false);
                }}
                className="h-9 rounded-lg bg-alerte px-3 text-[13.5px] font-semibold text-white disabled:opacity-70"
              >
                {t("annuler")}
              </button>
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmation(true)}
            className="mt-3 flex h-9 items-center gap-1.5 rounded-lg px-1 text-[13.5px] font-semibold text-encre-douce transition hover:text-alerte"
          >
            <X className="size-4" strokeWidth={2.4} /> {t("annuler")}
          </button>
        ))}
    </li>
  );
}
