"use client";

// Une section = un formulaire indépendant : on modifie, on voit « Modifications non
// enregistrées », on enregistre ou on annule. Rien n'est enregistré par mégarde ailleurs.
import { Check, Loader2, type LucideIcon } from "lucide-react";
import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { EtatInformations } from "@/app/espace/actions";
import { sansAccents } from "@/lib/format";
import type { TraduireEquipe } from "@/lib/i18n/equipe";
import { FICHES_LANGUES, LANGUES_EQUIPE } from "@/lib/langues";
import type { DefinitionChamp } from "./sections";

type Action = (
  etat: EtatInformations,
  formulaire: FormData,
) => Promise<EtatInformations>;

// Durée du « Enregistré » après un enregistrement réussi
const CONFIRMATION_MS = 2500;

export const CLASSE_CHAMP =
  "texte-champs-equipe h-10 w-full rounded-lg border border-ligne bg-fond px-3 text-champs-equipe outline-none transition focus:border-encre aria-invalid:border-alerte aria-invalid:bg-alerte/[0.04]";

/** Champs refusés par le serveur, et texte recherché (pour le surlignage). */
const ContexteSection = createContext<{ refuses: string[]; requete: string }>({
  refuses: [],
  requete: "",
});
export const useSection = () => use(ContexteSection);

// Instantané des valeurs du formulaire : sert à savoir s'il a été modifié
const instantane = (formulaire: HTMLFormElement) =>
  new URLSearchParams(
    [...new FormData(formulaire)].map(
      ([cle, valeur]) => [cle, String(valeur)] as [string, string],
    ),
  ).toString();

export function SectionFormulaire({
  id,
  icone: Icone,
  titre,
  description,
  badge,
  action,
  cachees,
  requete,
  masquee,
  sansEntete = false,
  t,
  children,
}: {
  id: string;
  icone: LucideIcon;
  titre: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  action: Action;
  cachees: Record<string, string>; // section, documentId…
  requete: string;
  masquee: boolean; // écartée par la recherche, mais gardée en mémoire avec ses modifications
  sansEntete?: boolean; // titre déjà donné par un onglet (Design)
  t: TraduireEquipe;
  children: React.ReactNode;
}) {
  const [etat, envoyer, enCours] = useActionState(action, { statut: "repos" });
  const formulaire = useRef<HTMLFormElement>(null);
  const reference = useRef("");
  const [modifie, setModifie] = useState(false);
  const [confirme, setConfirme] = useState(false);
  // Annuler : on remonte le contenu, qui retrouve ses valeurs enregistrées
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (formulaire.current) reference.current = instantane(formulaire.current);
  }, []);

  // Enregistré : les valeurs actuelles deviennent la référence
  useEffect(() => {
    if (etat.statut !== "enregistre" || !formulaire.current) return;
    reference.current = instantane(formulaire.current);
    setModifie(false);
    setConfirme(true);
    const minuteur = setTimeout(() => setConfirme(false), CONFIRMATION_MS);
    return () => clearTimeout(minuteur);
  }, [etat]);

  // Après le rendu (couleur choisie par un bouton, case cochée…), on compare à la référence
  const verifier = () =>
    requestAnimationFrame(() => {
      if (formulaire.current)
        setModifie(instantane(formulaire.current) !== reference.current);
    });

  const annuler = () => {
    setVersion((v) => v + 1);
    setModifie(false);
  };

  const enErreur = etat.statut === "erreur" && !modifie;
  const piedVisible = modifie || enErreur || confirme || enCours;

  return (
    <section id={id} hidden={masquee} className="scroll-mt-40 md:scroll-mt-24">
      <form
        ref={formulaire}
        // Envoi manuel : contrairement à action={…}, React ne vide pas le formulaire après coup,
        // et une saisie refusée reste à l'écran pour être corrigée
        onSubmit={(evenement) => {
          evenement.preventDefault();
          const donnees = new FormData(evenement.currentTarget);
          startTransition(() => envoyer(donnees));
        }}
        onInput={verifier}
        onChange={verifier}
        onClick={verifier}
        className="rounded-[24px] border border-ligne bg-surface shadow-carte"
      >
        {Object.entries(cachees).map(([nom, valeur]) => (
          <input key={nom} type="hidden" name={nom} value={valeur} />
        ))}

        <header
          hidden={sansEntete}
          className="flex items-start gap-3.5 px-5 pt-5 sm:px-6 sm:pt-6"
        >
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-bouton/10 text-bouton"
            aria-hidden
          >
            <Icone className="size-[19px]" strokeWidth={2.3} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="texte-sous-titres-equipe leading-tight text-sous-titres-equipe">
                <Surligne texte={titre} requete={requete} />
              </h2>
              {badge}
            </div>
            {description && (
              <p className="texte-details-equipe mt-0.5 text-details-equipe">
                {description}
              </p>
            )}
          </div>
        </header>

        <ContexteSection
          value={{
            refuses: etat.statut === "erreur" ? (etat.champs ?? []) : [],
            requete,
          }}
        >
          <div
            key={version}
            className={`px-5 pb-5 sm:px-6 sm:pb-6 ${sansEntete ? "pt-5 sm:pt-6" : "pt-5"}`}
          >
            {children}
          </div>
        </ContexteSection>

        {/* Pied de section ; collant pendant une modification, pour rester sous la main
            même au bas d'une longue section */}
        {piedVisible && (
          <div
            className={`z-[1] flex flex-wrap items-center justify-between gap-3 rounded-b-[24px] border-t border-ligne bg-surface/95 px-5 py-3 backdrop-blur sm:px-6 ${
              modifie ? "sticky bottom-[env(safe-area-inset-bottom)]" : ""
            }`}
          >
            <p aria-live="polite" className="texte-courant-equipe min-w-0">
              {enErreur ? (
                <span className="text-alerte">{t("verifierChamps")}</span>
              ) : modifie ? (
                <span className="flex items-center gap-2 text-encre-douce">
                  <span
                    className="size-2 shrink-0 rounded-full bg-[#d99a2b]"
                    aria-hidden
                  />
                  {t("modificationsNonEnregistrees")}
                </span>
              ) : confirme ? (
                <span className="flex items-center gap-1.5 font-semibold text-succes">
                  <Check className="size-4" strokeWidth={2.6} />{" "}
                  {t("enregistre")}
                </span>
              ) : null}
            </p>
            <div className="ms-auto flex items-center gap-2">
              {modifie && (
                <button
                  type="button"
                  onClick={annuler}
                  disabled={enCours}
                  className="texte-boutons-equipe h-10 rounded-xl px-4 text-encre-douce transition hover:bg-creux hover:text-encre"
                >
                  {t("annuler")}
                </button>
              )}
              {(modifie || enCours) && (
                <button
                  disabled={enCours}
                  className="texte-boutons-equipe flex h-10 items-center gap-2 rounded-xl bg-bouton px-5 text-texte-bouton transition active:scale-[0.98] disabled:opacity-70"
                >
                  {enCours && <Loader2 className="size-4 animate-spin" />}
                  {t("enregistrer")}
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </section>
  );
}

/** Un champ décrit dans sections.ts ; masqué (mais envoyé) quand la recherche l'écarte. */
export function Champ({
  definition,
  valeur,
  masque,
  t,
}: {
  definition: DefinitionChamp;
  valeur: string;
  masque: boolean;
  t: TraduireEquipe;
}) {
  const { refuses, requete } = useSection();
  const invalide = refuses.includes(definition.nom) || undefined;
  return (
    <label
      hidden={masque}
      className="grid items-center gap-x-6 gap-y-1.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      <span className="texte-libelles-equipe min-w-0 text-libelles-equipe">
        <Surligne texte={definition.libelle(t)} requete={requete} />
        {definition.aide && (
          <span className="texte-details-equipe mt-0.5 block text-details-equipe">
            {t(definition.aide)}
          </span>
        )}
      </span>
      {definition.type === "langue" ? (
        <select
          name={definition.nom}
          defaultValue={valeur}
          className={CLASSE_CHAMP}
        >
          {LANGUES_EQUIPE.map((code) => (
            <option key={code} value={code}>
              {FICHES_LANGUES[code].nomNatif}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={definition.nom}
          type={definition.type ?? "text"}
          defaultValue={valeur}
          placeholder={definition.placeholder && t(definition.placeholder)}
          aria-invalid={invalide}
          dir={
            definition.type === "tel" || definition.type === "url"
              ? "ltr"
              : undefined
          }
          className={CLASSE_CHAMP}
        />
      )}
    </label>
  );
}

/** Met en évidence le texte recherché (la recherche ignore accents et majuscules). */
export function Surligne({
  texte,
  requete,
}: {
  texte: string;
  requete: string;
}) {
  const comparable = sansAccents(texte);
  const debut = requete ? comparable.indexOf(requete) : -1;
  // Les indices ne correspondent que si retirer les accents n'a pas changé la longueur
  if (debut < 0 || comparable.length !== texte.length) return texte;
  return (
    <>
      {texte.slice(0, debut)}
      <mark className="rounded-[4px] bg-[#f6e3a1] px-0.5 text-inherit">
        {texte.slice(debut, debut + requete.length)}
      </mark>
      {texte.slice(debut + requete.length)}
    </>
  );
}
