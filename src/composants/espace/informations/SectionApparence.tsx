"use client";

// Couleurs de la carte côté client : un thème prêt en un toucher, puis le réglage fin
// de chaque couleur (fond, boutons, textes, titres, horaires), avec un aperçu en direct.
import { Check, Menu, Search } from "lucide-react";
import { useState } from "react";
import {
  FOND_PAR_DEFAUT,
  FONDS_SUGGERES,
  fondAssezClair,
  lisibleSurBlanc,
  TEXTE_PAR_DEFAUT,
  texteLisible,
  THEMES,
  type ThemeCouleurs,
  variablesCouleurs,
} from "@/lib/couleurs";
import type { TraduireEquipe } from "@/lib/i18n/equipe";
import { Surligne, useSection } from "./SectionFormulaire";

export type CouleursEtablissement = {
  couleurAccent: string;
  couleurFond: string | null; // null : blanc cassé par défaut
  couleurHoraires: string | null; // null : couleur de l'établissement, assombrie
  couleurBoutons: string | null; // null : couleur de l'établissement assombrie (client), encre (espace)
  couleurTexte: string | null; // null : encre
  couleurTitres: string | null; // null : couleur des boutons
};

const PASTILLE =
  "h-11 w-20 shrink-0 cursor-pointer rounded-xl border border-ligne bg-fond px-1 disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-alerte";

export function SectionApparence({
  couleurs,
  t,
}: {
  couleurs: CouleursEtablissement;
  t: TraduireEquipe;
}) {
  const { refuses, requete } = useSection();
  const [accent, setAccent] = useState(couleurs.couleurAccent);
  const [fond, setFond] = useState(couleurs.couleurFond ?? FOND_PAR_DEFAUT);
  const boutons = useCouleur(couleurs.couleurBoutons, "#1d4e89");
  const textes = useCouleur(couleurs.couleurTexte, TEXTE_PAR_DEFAUT);
  const titres = useCouleur(
    couleurs.couleurTitres,
    couleurs.couleurBoutons ?? "#1d4e89",
  );
  const horaires = useCouleur(couleurs.couleurHoraires, "#1d4e89");

  const fondValide = fondAssezClair(fond) && !refuses.includes("couleurFond");
  const textesValides =
    textes.auto ||
    (texteLisible(textes.couleur) && !refuses.includes("couleurTexte"));
  const titresValides =
    titres.auto ||
    (lisibleSurBlanc(titres.couleur) && !refuses.includes("couleurTitres"));
  const horairesValides =
    horaires.auto ||
    (lisibleSurBlanc(horaires.couleur) && !refuses.includes("couleurHoraires"));

  const appliquerTheme = (theme: ThemeCouleurs) => {
    setAccent(theme.boutons);
    setFond(theme.fond);
    boutons.choisir(theme.boutons);
    textes.choisir(theme.textes);
    titres.choisir(theme.titres);
    horaires.choisir(theme.horaires);
  };
  const themeActif = (theme: ThemeCouleurs) =>
    fond.toLowerCase() === theme.fond &&
    boutons.valeur?.toLowerCase() === theme.boutons &&
    titres.valeur?.toLowerCase() === theme.titres &&
    (textes.valeur?.toLowerCase() ?? TEXTE_PAR_DEFAUT) === theme.textes;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-6">
        {/* Thèmes prêts : toutes les couleurs d'un coup, déjà lisibles ensemble */}
        <div>
          <p className="text-[14px] font-semibold text-encre">
            <Surligne texte={t("themesPrets")} requete={requete} />
          </p>
          <p className="mt-0.5 text-[13px] text-encre-pale">
            {t("aideThemes")}
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {THEMES.map((theme) => {
              const actif = themeActif(theme);
              return (
                <li key={theme.nom}>
                  <button
                    type="button"
                    onClick={() => appliquerTheme(theme)}
                    aria-pressed={actif}
                    style={{ backgroundColor: theme.fond }}
                    className={`relative flex w-full flex-col items-start gap-2 rounded-xl border p-2.5 text-start transition active:scale-[0.97] ${
                      actif
                        ? "border-encre ring-2 ring-encre ring-offset-1"
                        : "border-ligne"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="size-5 rounded-full"
                        style={{ backgroundColor: theme.boutons }}
                      />
                      <span
                        className="font-serif text-[19px] leading-none"
                        style={{ color: theme.titres }}
                      >
                        Aa
                      </span>
                    </span>
                    <span
                      className="text-[12.5px] font-semibold leading-tight"
                      style={{ color: theme.textes }}
                    >
                      {t(`theme_${theme.nom}` as const)}
                    </span>
                    {actif && (
                      <span className="absolute end-1.5 bottom-1.5 grid size-4 place-items-center rounded-full bg-encre text-white">
                        <Check className="size-2.5" strokeWidth={3.5} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Réglage fin, couleur par couleur */}
        <ul className="divide-y divide-encre/10 border-t border-encre/10 pt-1">
          <Ligne
            libelle={t("couleurFond")}
            erreur={fondValide ? undefined : t("fondTropSombre")}
            empile
          >
            <input type="hidden" name="couleurFond" value={fond} />
            <div className="flex flex-wrap items-center gap-2">
              {FONDS_SUGGERES.map(({ couleur, nom }) => (
                <button
                  key={couleur}
                  type="button"
                  onClick={() => setFond(couleur)}
                  aria-pressed={fond === couleur}
                  aria-label={t(`fond_${nom}` as const)}
                  title={t(`fond_${nom}` as const)}
                  style={{ backgroundColor: couleur }}
                  className={`size-9 rounded-full border transition active:scale-95 ${
                    fond === couleur
                      ? "border-encre ring-2 ring-encre ring-offset-2"
                      : "border-ligne"
                  }`}
                />
              ))}
              <label className="ms-1 flex cursor-pointer items-center gap-2 text-[13.5px] text-encre">
                <input
                  type="color"
                  value={fond}
                  onChange={(evenement) => setFond(evenement.target.value)}
                  aria-invalid={!fondValide || undefined}
                  className="h-9 w-12 cursor-pointer rounded-xl border border-ligne bg-fond px-1 aria-invalid:border-alerte"
                />
                {t("autreCouleur")}
              </label>
            </div>
          </Ligne>
          <Ligne libelle={t("couleurBoutons")}>
            <ChoixCouleur
              nom="couleurBoutons"
              libelle={t("couleurBoutons")}
              etat={boutons}
              t={t}
            />
          </Ligne>
          <Ligne
            libelle={t("couleurTexte")}
            erreur={textesValides ? undefined : t("texteTropClair")}
          >
            <ChoixCouleur
              nom="couleurTexte"
              libelle={t("couleurTexte")}
              etat={textes}
              invalide={!textesValides}
              t={t}
            />
          </Ligne>
          <Ligne
            libelle={t("couleurTitres")}
            erreur={titresValides ? undefined : t("titresTropClair")}
          >
            <ChoixCouleur
              nom="couleurTitres"
              libelle={t("couleurTitres")}
              etat={titres}
              invalide={!titresValides}
              t={t}
            />
          </Ligne>
          <Ligne
            libelle={t("couleurHoraires")}
            erreur={horairesValides ? undefined : t("horairesTropClair")}
          >
            <ChoixCouleur
              nom="couleurHoraires"
              libelle={t("couleurHoraires")}
              etat={horaires}
              invalide={!horairesValides}
              t={t}
            />
          </Ligne>
          <Ligne libelle={t("couleurAccent")}>
            <input
              name="couleurAccent"
              type="color"
              value={accent}
              onChange={(evenement) => setAccent(evenement.target.value)}
              aria-label={t("couleurAccent")}
              className={PASTILLE}
            />
          </Ligne>
        </ul>
      </div>

      {/* Aperçu : ce que verra le client, avant même d'enregistrer */}
      <div
        aria-hidden
        style={
          variablesCouleurs({
            couleurAccent: accent,
            couleurFond: fond,
            couleurBoutons: boutons.valeur,
            couleurTexte: textes.valeur,
            couleurTitres: titres.valeur,
            couleurHoraires: horaires.valeur,
          }) as React.CSSProperties
        }
        className="h-fit overflow-hidden rounded-2xl border border-ligne bg-fond lg:sticky lg:top-24"
      >
        <p className="px-4 pt-3 text-[11.5px] font-bold uppercase tracking-[0.14em] text-encre-pale">
          {t("apercu")}
        </p>
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span className="grid size-8 place-items-center rounded-xl bg-bouton font-serif text-[17px] text-texte-bouton">
            T
          </span>
          <span className="flex-1 font-serif text-[18px] leading-none text-encre">
            Tabla
          </span>
          <Search className="size-[19px] text-encre" strokeWidth={2.5} />
          <Menu className="size-[21px] text-encre" strokeWidth={2.5} />
        </div>
        <div className="flex gap-2 border-y border-ligne px-4 py-2.5">
          <span className="rounded-full bg-bouton px-3 py-1.5 text-[12px] font-semibold text-texte-bouton">
            {t("apercuRubrique1")}
          </span>
          <span className="rounded-full border border-ligne bg-surface px-3 py-1.5 text-[12px] font-semibold text-encre">
            {t("apercuRubrique2")}
          </span>
        </div>
        <div className="px-4 pt-3 pb-4">
          <p className="flex items-baseline justify-between">
            <span className="font-serif text-[22px] leading-tight text-titres">
              {t("apercuRubrique1")}
            </span>
            <span className="text-[11.5px] font-semibold tabular-nums text-horaires">
              12h – 23h
            </span>
          </p>
          <div className="divide-y divide-ligne">
            {[0, 1].map((rang) => (
              <div key={rang} className="flex gap-3 py-3">
                <span className="size-14 shrink-0 rounded-xl bg-accent-pale" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[14px] font-bold text-encre">
                    {t("apercuPlat")}
                  </span>
                  <span className="mt-0.5 h-2 w-4/5 rounded-full bg-encre-pale/30" />
                  <span className="mt-auto flex items-center justify-between">
                    <span className="text-[12.5px] font-bold tabular-nums text-encre">
                      7 500 FCFA
                    </span>
                    <span className="grid size-6 place-items-center rounded-full bg-bouton text-[14px] font-bold leading-none text-texte-bouton">
                      +
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>
          <span className="mt-1 flex h-10 items-center justify-center rounded-xl bg-bouton text-[13.5px] font-semibold text-texte-bouton">
            {t("apercuBouton")}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Une ligne de réglage : le libellé à gauche, la commande à droite (ou dessous). */
function Ligne({
  libelle,
  erreur,
  empile,
  children,
}: {
  libelle: string;
  erreur?: string;
  empile?: boolean;
  children: React.ReactNode;
}) {
  const { requete } = useSection();
  return (
    <li className="py-3.5 last:pb-0">
      <div
        className={`flex gap-x-4 gap-y-2.5 ${empile ? "flex-col" : "flex-wrap items-center justify-between sm:flex-nowrap"}`}
      >
        <span className="min-w-0 text-[14px] font-semibold text-encre">
          <Surligne texte={libelle} requete={requete} />
        </span>
        {children}
      </div>
      {erreur && <p className="mt-1.5 text-[12.5px] text-alerte">{erreur}</p>}
    </li>
  );
}

/** Couleur choisie, ou « Automatique » (null : couleur par défaut). */
function useCouleur(initiale: string | null, suggestion: string) {
  const [auto, setAuto] = useState(initiale === null);
  const [couleur, setCouleur] = useState(initiale ?? suggestion);
  const choisir = (nouvelle: string) => {
    setAuto(false);
    setCouleur(nouvelle);
  };
  return {
    auto,
    setAuto,
    couleur,
    setCouleur,
    choisir,
    valeur: auto ? null : couleur,
  };
}

function ChoixCouleur({
  nom,
  libelle,
  etat,
  invalide,
  t,
}: {
  nom: string;
  libelle: string;
  etat: ReturnType<typeof useCouleur>;
  invalide?: boolean;
  t: TraduireEquipe;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-encre-douce">
        <input
          name={`${nom}Auto`}
          type="checkbox"
          checked={etat.auto}
          onChange={(evenement) => etat.setAuto(evenement.target.checked)}
          className="size-4 accent-encre"
        />
        {t("automatique")}
      </label>
      <input
        name={nom}
        type="color"
        value={etat.couleur}
        disabled={etat.auto}
        onChange={(evenement) => etat.setCouleur(evenement.target.value)}
        aria-label={libelle}
        aria-invalid={invalide || undefined}
        className={PASTILLE}
      />
    </div>
  );
}
