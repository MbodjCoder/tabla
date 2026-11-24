"use client";

// Menu de la table (bouton ☰) : il descend du haut, sous le doigt. Les rubriques sont présentées
// comme celles de l'accueil de l'équipe (Nouvelles, En cours, Appels) : une grande rubrique
// anthracite par ligne, icône, nom, et son nombre en pastille. Appeler un serveur, demander
// l'addition, et « Mes commandes » dès qu'il y en a (la langue suit celle du téléphone). Un appel déjà envoyé
// reste affiché comme confirmé (vert, coché) jusqu'à ce que l'équipe le traite.
import {
  BellRing,
  Check,
  ClipboardList,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import type { TraduireClient } from "@/lib/i18n/client";
import type { TypeAppelVue } from "@/lib/types";
import { FeuilleBas } from "./FeuilleBas";

type Proprietes = {
  ouverte: boolean;
  titre: string;
  t: TraduireClient;
  appels: TypeAppelVue[];
  commandes: number; // commandes de la table : « Mes commandes » n'apparaît qu'à partir d'une
  enCours: number; // envoyées ou en préparation : le nombre en pastille
  onAppeler: (type: TypeAppelVue) => Promise<boolean>;
  onSuivi: () => void;
  onFermer: () => void;
};

export function FeuilleMenu({
  ouverte,
  titre,
  t,
  appels,
  commandes,
  enCours,
  onAppeler,
  onSuivi,
  onFermer,
}: Proprietes) {
  const appel = (type: TypeAppelVue) => () =>
    !appels.includes(type) && void onAppeler(type);

  return (
    <FeuilleBas
      ouverte={ouverte}
      titre={titre}
      libelleFermer={t("fermer")}
      onFermer={onFermer}
      depuisLeHaut
    >
      <div className="overflow-y-auto overscroll-contain px-5 pb-2">
        <ul className="space-y-3">
          <Rubrique
            icone={BellRing}
            libelle={
              appels.includes("SERVEUR")
                ? t("serveurPrevenu")
                : t("appelerServeur")
            }
            confirme={appels.includes("SERVEUR")}
            onClick={appel("SERVEUR")}
          />
          <Rubrique
            icone={ReceiptText}
            libelle={
              appels.includes("ADDITION")
                ? t("additionDemandee")
                : t("demanderAddition")
            }
            confirme={appels.includes("ADDITION")}
            onClick={appel("ADDITION")}
          />
          {commandes > 0 && (
            <Rubrique
              icone={ClipboardList}
              libelle={t("mesCommandes")}
              nombre={enCours}
              onClick={onSuivi}
            />
          )}
        </ul>
      </div>
    </FeuilleBas>
  );
}

/**
 * Une rubrique, comme sur l'accueil de l'équipe : grande, anthracite, icône blanche, nom bien
 * lisible et nombre en pastille au bout ; verte et cochée une fois l'appel envoyé.
 */
function Rubrique({
  icone: Icone,
  libelle,
  nombre = 0,
  confirme = false,
  onClick,
}: {
  icone: LucideIcon;
  libelle: string;
  nombre?: number;
  confirme?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={confirme}
        className={`flex h-[88px] w-full items-center gap-5 rounded-[24px] px-6 text-start shadow-carte transition active:scale-[0.98] ${
          confirme
            ? "bg-succes text-white"
            : "bg-bouton text-texte-bouton hover:opacity-90"
        }`}
      >
        {confirme ? (
          <Check className="size-11 shrink-0" strokeWidth={2.6} aria-hidden />
        ) : (
          <Icone className="size-11 shrink-0" strokeWidth={2} aria-hidden />
        )}
        <span
          aria-live="polite"
          className="min-w-0 flex-1 text-[20px] leading-tight font-bold"
        >
          {libelle}
        </span>
        {nombre > 0 && (
          <span className="grid h-10 min-w-10 shrink-0 place-items-center rounded-full bg-alerte px-2.5 text-[18px] leading-none font-bold text-white tabular-nums">
            {nombre}
          </span>
        )}
      </button>
    </li>
  );
}
