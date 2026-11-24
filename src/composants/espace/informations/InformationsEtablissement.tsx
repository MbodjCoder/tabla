"use client";

// « Informations de l'établissement » : identité, apparence et contacts réunis sur une page.
// Un sommaire (colonne sur ordinateur, onglets défilants sur téléphone) suit la lecture,
// et une recherche filtre sections et champs, sans perdre une saisie en cours.
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { enregistrerInformations } from "@/app/espace/actions";
import { sansAccents } from "@/lib/format";
import { traducteurEquipe } from "@/lib/i18n/equipe";
import type { LangueEquipe } from "@/lib/langues";
import type { Typographie } from "@/lib/typographie";
import {
  SectionApparence,
  type CouleursEtablissement,
} from "./SectionApparence";
import { Champ, SectionFormulaire } from "./SectionFormulaire";
import { SectionTypographie } from "./SectionTypographie";
import { SECTIONS } from "./sections";

type EntreeSommaire = { id: string; titre: string; icone: React.ElementType };

export function InformationsEtablissement({
  langue,
  valeurs,
  couleurs,
  typographie,
}: {
  langue: LangueEquipe;
  valeurs: Record<string, string>;
  couleurs: CouleursEtablissement;
  typographie: Typographie;
}) {
  const t = traducteurEquipe(langue);
  const [recherche, setRecherche] = useState("");
  const requete = sansAccents(recherche.trim());
  const correspond = (...textes: (string | undefined)[]) =>
    !requete ||
    textes.some((texte) => texte && sansAccents(texte).includes(requete));

  // Ce que la recherche garde : une section dont le titre correspond garde tous ses champs
  const sections = SECTIONS.map((section) => {
    const titre = section.titre(t);
    const titreCorrespond = correspond(titre, t(section.description));
    const champsVisibles = new Set(
      section.champs
        .filter(
          (champ) =>
            titreCorrespond ||
            correspond(
              champ.libelle(t),
              champ.aide && t(champ.aide),
              champ.placeholder && t(champ.placeholder),
            ),
        )
        .map((champ) => champ.nom),
    );
    const visible = section.champs.length
      ? champsVisibles.size > 0
      : titreCorrespond ||
        correspond(...(section.motsCles ?? []).map((cle) => t(cle)));
    return { ...section, titre, champsVisibles, visible };
  });
  const groupes: { titre: string; entrees: EntreeSommaire[] }[] = [
    {
      titre: t("sommaire"),
      entrees: sections
        .filter((s) => s.visible)
        .map((s) => ({ id: s.id, titre: s.titre, icone: s.icone })),
    },
  ];
  const entrees = groupes.flatMap((groupe) => groupe.entrees);
  const actif = useSectionActive(entrees.map((entree) => entree.id));

  return (
    <>
      {/* Le titre et la flèche de retour : EnTetePage, posé par la page */}
      <div className="mt-6 flex justify-center">
        <label className="relative block w-full md:w-[400px]">
          <span className="sr-only">{t("rechercher")}</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-encre-pale" />
          <input
            type="search"
            value={recherche}
            onChange={(evenement) => setRecherche(evenement.target.value)}
            onKeyDown={(evenement) =>
              evenement.key === "Escape" && setRecherche("")
            }
            placeholder={t("rechercherInformations")}
            className="texte-champs-equipe h-12 w-full rounded-2xl border border-ligne bg-surface ps-11 pe-11 text-champs-equipe shadow-carte outline-none transition placeholder:text-encre-pale focus:border-encre [&::-webkit-search-cancel-button]:hidden"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => setRecherche("")}
              aria-label={t("fermerRecherche")}
              className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-encre-pale transition hover:bg-creux hover:text-encre"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>

      <div className="mt-8 md:grid md:grid-cols-[230px_minmax(0,1fr)] md:gap-10">
        <Sommaire groupes={groupes} actif={actif} libelle={t("sommaire")} />

        <div className="min-w-0">
          {entrees.length === 0 && (
            <p className="texte-details-equipe rounded-[24px] border border-ligne bg-surface px-5 py-10 text-center text-details-equipe">
              {t("aucunResultat", { q: recherche.trim() })}
            </p>
          )}

          {/* Chaque section s'enregistre seule */}
          <div className="space-y-6">
            {sections.map((section) => (
              <SectionFormulaire
                key={section.id}
                id={section.id}
                icone={section.icone}
                titre={section.titre}
                description={t(section.description)}
                action={enregistrerInformations}
                cachees={{ section: section.id }}
                requete={requete}
                masquee={!section.visible}
                t={t}
              >
                {section.id === "apparence" ? (
                  <SectionApparence couleurs={couleurs} t={t} />
                ) : section.id === "typographie" ? (
                  <SectionTypographie
                    typographie={typographie}
                    couleurs={couleurs}
                    langue={langue}
                    t={t}
                  />
                ) : (
                  <div className="divide-y divide-ligne">
                    {section.champs.map((champ) => (
                      <Champ
                        key={champ.nom}
                        definition={champ}
                        valeur={valeurs[champ.nom] ?? ""}
                        masque={!section.champsVisibles.has(champ.nom)}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </SectionFormulaire>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/** Sommaire : colonne collante sur ordinateur, onglets défilants collés sous l'en-tête sur téléphone. */
function Sommaire({
  groupes,
  actif,
  libelle,
}: {
  groupes: { titre: string; entrees: EntreeSommaire[] }[];
  actif: string;
  libelle: string;
}) {
  const bandeau = useRef<HTMLDivElement>(null);

  // Sur téléphone, l'onglet actif reste visible dans le bandeau (sans faire défiler la page)
  useEffect(() => {
    const conteneur = bandeau.current;
    const onglet = conteneur?.querySelector<HTMLElement>(
      `[data-cible="${actif}"]`,
    );
    if (!conteneur || !onglet) return;
    const gauche =
      onglet.offsetLeft - (conteneur.clientWidth - onglet.offsetWidth) / 2;
    conteneur.scrollTo({ left: gauche, behavior: "smooth" });
  }, [actif]);

  const aller = (id: string) => (evenement: React.MouseEvent) => {
    evenement.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      {/* Téléphone */}
      <nav
        aria-label={libelle}
        className="sticky top-[68px] z-10 -mx-5 mb-6 border-b border-ligne bg-fond/90 backdrop-blur-xl md:hidden"
      >
        <div
          ref={bandeau}
          className="flex gap-2 overflow-x-auto px-5 py-2.5 [scrollbar-width:none]"
        >
          {groupes
            .flatMap((groupe) => groupe.entrees)
            .map((entree) => (
              <a
                key={entree.id}
                href={`#${entree.id}`}
                data-cible={entree.id}
                onClick={aller(entree.id)}
                className={`texte-boutons-equipe relative flex h-9 shrink-0 items-center rounded-full px-3.5 transition ${
                  actif === entree.id
                    ? "bg-selection text-texte-selection"
                    : "border border-ligne bg-surface text-encre-douce"
                }`}
              >
                {entree.titre}
              </a>
            ))}
        </div>
      </nav>

      {/* Ordinateur */}
      <nav aria-label={libelle} className="hidden md:block">
        <div className="sticky top-24 space-y-6">
          {groupes
            .filter((groupe) => groupe.entrees.length > 0)
            .map((groupe) => (
              <div key={groupe.titre}>
                <p className="texte-sections-equipe px-3 uppercase text-sections-equipe">
                  {groupe.titre}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {groupe.entrees.map(({ id, titre, icone: Icone }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={aller(id)}
                        aria-current={actif === id ? "location" : undefined}
                        className={`texte-libelles-equipe flex items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                          actif === id
                            ? "bg-nav-actif text-texte-nav-actif"
                            : "text-encre-douce hover:bg-creux/70 hover:text-encre"
                        }`}
                      >
                        <Icone
                          className="size-4 shrink-0"
                          strokeWidth={2.3}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate" title={titre}>
                          {titre}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </nav>
    </>
  );
}

/** La section en cours de lecture : celle qui traverse le haut de l'écran. */
function useSectionActive(ids: string[]) {
  const [actif, setActif] = useState(ids[0] ?? "");
  const cle = ids.join("|");
  const liste = useMemo(() => cle.split("|").filter(Boolean), [cle]);

  useEffect(() => {
    if (!liste.length) return;
    if (!liste.includes(actif)) setActif(liste[0]);
    const visibles = new Map<string, boolean>();
    const observateur = new IntersectionObserver(
      (observations) => {
        for (const observation of observations)
          visibles.set(observation.target.id, observation.isIntersecting);
        const premier = liste.find((id) => visibles.get(id));
        if (premier) setActif(premier);
      },
      // Bande étroite sous l'en-tête : la section qui la traverse est celle qu'on lit
      { rootMargin: "-150px 0px -55% 0px" },
    );
    for (const id of liste) {
      const element = document.getElementById(id);
      if (element) observateur.observe(element);
    }
    return () => observateur.disconnect();
    // actif volontairement absent : l'observateur ne dépend que des sections affichées
  }, [liste]);

  return actif;
}
