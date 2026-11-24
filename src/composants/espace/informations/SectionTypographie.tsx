"use client";

// Les textes de l'écran du client, un à la fois : police (24 styles rangés par famille), taille
// au pixel près, épaisseur et couleur (celle du thème par défaut). Un aperçu de l'écran du client,
// à ses couleurs, suit chaque réglage avant même l'enregistrement.
import {
  CupSoda,
  Clock3,
  EllipsisVertical,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Utensils,
  CakeSlice,
} from "lucide-react";
import { useState } from "react";
import { variablesCouleurs } from "@/lib/couleurs";
import { traducteurClient } from "@/lib/i18n/client";
import type { CleTexteEquipe, TraduireEquipe } from "@/lib/i18n/equipe";
import type { LangueEquipe } from "@/lib/langues";
import {
  FAMILLES_POLICES,
  GRAISSES,
  ORDRE_ROLES,
  POLICES,
  ROLES_TEXTE,
  type FamillePolice,
  type RoleTexte,
  type StyleTexte,
  type Typographie,
  variablesTypographie,
} from "@/lib/typographie";
import type { CouleursEtablissement } from "./SectionApparence";
import { useSection } from "./SectionFormulaire";

const LIBELLES_ROLES: Record<RoleTexte, CleTexteEquipe> = {
  recherche: "roleRecherche",
  rubriques: "roleRubriques",
  titreRubrique: "roleTitreRubrique",
  horaires: "roleHoraires",
  nomPlat: "roleNomPlat",
  description: "roleDescription",
  prix: "rolePrix",
  boutonAjouter: "roleBoutonAjouter",
  barreCommande: "roleBarreCommande",
};

// Couleur proposée dans le sélecteur quand le texte suit encore le thème
const COULEUR_DEPART: Record<RoleTexte, string> = {
  recherche: "#1c1917",
  rubriques: "#1c1917",
  titreRubrique: "#1c1917",
  horaires: "#8b4513",
  nomPlat: "#1c1917",
  description: "#57534e",
  prix: "#1c1917",
  boutonAjouter: "#ffffff",
  barreCommande: "#ffffff",
};

export function SectionTypographie({
  typographie,
  couleurs,
  langue,
  t,
}: {
  typographie: Typographie;
  couleurs: CouleursEtablissement;
  langue: LangueEquipe;
  t: TraduireEquipe;
}) {
  const { refuses } = useSection();
  const [styles, setStyles] = useState(typographie);
  const [roleActif, setRoleActif] = useState<RoleTexte>("nomPlat");
  const { min, max, defaut } = ROLES_TEXTE[roleActif];
  const style = styles[roleActif];
  const tClient = traducteurClient(langue);

  const libellesFamilles: Record<FamillePolice, string> = {
    elegant: t("famille_elegant"),
    moderne: t("famille_moderne"),
    affirme: t("famille_affirme"),
    manuscrit: t("famille_manuscrit"),
    ludique: t("famille_ludique"),
  };
  const exemples: Record<RoleTexte, string> = {
    recherche: tClient("placeholderRecherche"),
    rubriques: tClient("famille_plats"),
    titreRubrique: t("apercuRubrique"),
    horaires: "12h – 23h",
    nomPlat: t("apercuPlat"),
    description: t("apercuDescription"),
    prix: "7 500 FCFA",
    boutonAjouter: tClient("ajouter"),
    barreCommande: tClient("voirCommande"),
  };

  const modifier = (changement: Partial<StyleTexte>) =>
    setStyles((actuels) => ({
      ...actuels,
      [roleActif]: { ...actuels[roleActif], ...changement },
    }));
  const changerTaille = (taille: number) =>
    modifier({ taille: Math.min(max, Math.max(min, Math.round(taille))) });
  const modifie =
    style.police !== defaut.police ||
    style.taille !== defaut.taille ||
    style.graisse !== defaut.graisse ||
    style.couleur !== null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Valeurs envoyées à l'enregistrement : tous les textes, quel que soit celui ouvert */}
      {ORDRE_ROLES.map((role) => (
        <span key={role} hidden>
          <input
            type="hidden"
            name={`police_${role}`}
            value={styles[role].police}
          />
          <input
            type="hidden"
            name={`taille_${role}`}
            value={styles[role].taille}
          />
          <input
            type="hidden"
            name={`graisse_${role}`}
            value={styles[role].graisse}
          />
          <input
            type="hidden"
            name={`couleur_${role}`}
            value={styles[role].couleur ?? ""}
          />
        </span>
      ))}

      <div className="min-w-0 space-y-6">
        {/* Le texte à régler, dans l'ordre de l'écran du client */}
        <div>
          <p className="text-[14px] font-semibold text-encre">
            {t("texteARegler")}
          </p>
          <div role="tablist" className="mt-2 flex flex-wrap gap-2">
            {ORDRE_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={roleActif === role}
                onClick={() => setRoleActif(role)}
                className={`h-9 rounded-full border px-3.5 text-[13px] font-semibold transition active:scale-95 ${
                  roleActif === role
                    ? "border-encre bg-encre text-white"
                    : "border-ligne bg-surface text-encre-douce hover:text-encre"
                } ${refuses.includes(`taille_${role}`) ? "ring-2 ring-alerte" : ""}`}
              >
                {t(LIBELLES_ROLES[role])}
              </button>
            ))}
          </div>
        </div>

        {/* Taille */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-encre">
              {t("tailleTexte")}
            </p>
            <span className="text-[14px] font-bold tabular-nums text-encre">
              {style.taille} px
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => changerTaille(style.taille - 1)}
              disabled={style.taille <= min}
              aria-label={t("plusPetit")}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-ligne bg-surface text-encre transition active:scale-95 disabled:opacity-40"
            >
              <Minus className="size-4" strokeWidth={2.4} />
            </button>
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={style.taille}
              onChange={(evenement) =>
                changerTaille(Number(evenement.target.value))
              }
              aria-label={t("tailleTexte")}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-bouton"
            />
            <button
              type="button"
              onClick={() => changerTaille(style.taille + 1)}
              disabled={style.taille >= max}
              aria-label={t("plusGrand")}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-ligne bg-surface text-encre transition active:scale-95 disabled:opacity-40"
            >
              <Plus className="size-4" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Épaisseur */}
        <div>
          <p className="text-[14px] font-semibold text-encre">
            {t("epaisseurTexte")}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl bg-creux p-1">
            {GRAISSES.map((graisse) => (
              <button
                key={graisse}
                type="button"
                onClick={() => modifier({ graisse })}
                aria-pressed={style.graisse === graisse}
                style={{ fontWeight: graisse }}
                className={`h-10 rounded-xl text-[14px] transition ${
                  style.graisse === graisse
                    ? "bg-surface text-encre shadow-carte"
                    : "text-encre-douce hover:text-encre"
                }`}
              >
                {t(`graisse_${graisse}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Couleur : celle du thème, ou une couleur choisie pour ce texte seulement */}
        <div>
          <p className="text-[14px] font-semibold text-encre">
            {t("couleurTexteRole")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => modifier({ couleur: null })}
              aria-pressed={style.couleur === null}
              className={`h-10 rounded-full border px-4 text-[13.5px] font-semibold transition ${
                style.couleur === null
                  ? "border-encre bg-encre text-white"
                  : "border-ligne bg-surface text-encre"
              }`}
            >
              {t("couleurDuTheme")}
            </button>
            <label
              className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border ps-1.5 pe-4 text-[13.5px] font-semibold transition ${
                style.couleur !== null
                  ? "border-encre ring-1 ring-encre"
                  : "border-ligne bg-surface"
              }`}
            >
              <input
                type="color"
                value={style.couleur ?? COULEUR_DEPART[roleActif]}
                onChange={(evenement) =>
                  modifier({ couleur: evenement.target.value })
                }
                aria-label={t("couleurTexteRole")}
                className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-ligne [&::-webkit-color-swatch-wrapper]:p-0"
              />
              <span className="font-mono text-encre uppercase">
                {style.couleur ?? t("choisirCouleur")}
              </span>
            </label>
          </div>
        </div>

        {/* Style : chaque police s'affiche avec le texte qu'elle habillera */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-encre">
              {t("styleTexte")}
            </p>
            {modifie && (
              <button
                type="button"
                onClick={() => modifier({ ...defaut, couleur: null })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-encre-douce transition hover:text-encre"
              >
                <RotateCcw className="size-3.5" strokeWidth={2.2} />
                {t("styleOrigine")}
              </button>
            )}
          </div>
          <div className="mt-2 space-y-4">
            {FAMILLES_POLICES.map((famille) => (
              <div key={famille}>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-encre-pale">
                  {libellesFamilles[famille]}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {POLICES.filter((police) => police.famille === famille).map(
                    (police) => {
                      const choisie = style.police === police.id;
                      return (
                        <button
                          key={police.id}
                          type="button"
                          onClick={() => modifier({ police: police.id })}
                          aria-pressed={choisie}
                          className={`flex min-h-[68px] flex-col items-start justify-between gap-1 rounded-xl border px-3 py-2.5 text-start transition active:scale-[0.98] ${
                            choisie
                              ? "border-bouton bg-bouton/[0.06] ring-1 ring-bouton"
                              : "border-ligne bg-surface"
                          }`}
                        >
                          <span
                            className="block max-w-full truncate text-[19px] leading-tight text-encre"
                            style={{
                              fontFamily: `var(${police.variable})`,
                              fontWeight: style.graisse,
                            }}
                          >
                            {exemples[roleActif]}
                          </span>
                          <span className="text-[11.5px] font-medium text-encre-pale">
                            {police.nom}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Apercu
        styles={styles}
        couleurs={couleurs}
        exemples={exemples}
        familles={[
          tClient("famille_plats"),
          tClient("famille_boissons"),
          tClient("famille_desserts"),
        ]}
        t={t}
      />
    </div>
  );
}

/** L'écran du client en miniature, à ses couleurs et avec ces réglages. */
function Apercu({
  styles,
  couleurs,
  exemples,
  familles,
  t,
}: {
  styles: Typographie;
  couleurs: CouleursEtablissement;
  exemples: Record<RoleTexte, string>;
  familles: string[];
  t: TraduireEquipe;
}) {
  const variables = {
    ...variablesCouleurs(couleurs),
    ...variablesTypographie(styles),
  } as React.CSSProperties;
  return (
    <div aria-hidden className="h-fit lg:sticky lg:top-24">
      <p className="pb-2 text-[11.5px] font-bold uppercase tracking-[0.14em] text-encre-pale">
        {t("apercu")}
      </p>
      <div
        style={variables}
        className="overflow-hidden rounded-[28px] border border-ligne bg-fond p-3.5"
      >
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logos/logo-restaurant.svg"
            alt=""
            className="h-7 w-auto"
          />
          <span className="grid size-9 place-items-center rounded-full bg-white text-black shadow-carte">
            <EllipsisVertical className="size-5" strokeWidth={2.8} />
          </span>
        </div>
        <span className="mt-3 flex h-10 items-center gap-2 rounded-full border border-accent-doux bg-surface px-3.5">
          <Search
            className="size-4 shrink-0 text-encre-douce"
            strokeWidth={2.3}
          />
          <span className="texte-recherche truncate opacity-60">
            {exemples.recherche}
          </span>
        </span>
        <span className="mt-3 flex gap-1.5">
          {[
            { icone: Utensils, active: true },
            { icone: CupSoda, active: false },
            {
              icone: CakeSlice,
              cle: "famille_desserts" as const,
              active: false,
            },
          ].map(({ icone: Icone, active }, rang) => (
            <span
              key={rang}
              aria-pressed={active}
              className={`texte-rubriques flex h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-1.5 ${
                active ? "bg-bouton" : "bg-accent-doux"
              }`}
            >
              <Icone
                className={`size-3.5 shrink-0 ${active ? "" : "text-bouton"}`}
                strokeWidth={2.2}
              />
              <span className="truncate">{familles[rang]}</span>
            </span>
          ))}
        </span>
        <span className="mt-4 flex items-baseline justify-between gap-2 px-0.5">
          <span className="texte-titre-rubrique truncate">
            {exemples.titreRubrique}
          </span>
          <span className="texte-horaires flex shrink-0 items-center gap-1">
            <Clock3 className="size-3" strokeWidth={2.2} />
            {exemples.horaires}
          </span>
        </span>
        <span className="carte-plat relative isolate mt-2.5 flex min-h-[132px] overflow-hidden rounded-[18px] shadow-carte">
          <span className="absolute inset-y-0 start-0 -z-10 w-[37%] bg-accent-doux" />
          <span className="ms-[37%] flex min-w-0 flex-1 flex-col py-3 ps-3 pe-2.5">
            <span className="texte-nom-plat">{exemples.nomPlat}</span>
            <span className="texte-description mt-1 line-clamp-2">
              {exemples.description}
            </span>
            <span className="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-2">
              <span className="texte-prix whitespace-nowrap">
                {exemples.prix}
              </span>
              <span className="texte-bouton-ajouter flex h-7 shrink-0 items-center gap-0.5 rounded-full bg-bouton ps-2.5 pe-2">
                {exemples.boutonAjouter}
                <Plus className="size-3" strokeWidth={2.8} />
              </span>
            </span>
          </span>
        </span>
        <span className="mt-3 flex h-12 items-center gap-2 rounded-full bg-bouton ps-2 pe-4">
          <span className="grid size-8 place-items-center rounded-full bg-texte-bouton/20 text-[13px] font-bold text-texte-bouton">
            1
          </span>
          <span className="texte-barre-commande flex-1 truncate">
            {exemples.barreCommande}
          </span>
          <span className="texte-barre-commande tabular-nums">7 500</span>
        </span>
      </div>
    </div>
  );
}
