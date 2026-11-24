"use client";

// La table, côté client : la carte illustrée, le panier, l'envoi de la commande et son
// suivi. Décor chaleureux (fond crème, rameaux pâles), le logo et le bouton des services de
// la table (appeler un serveur, l'addition, mes commandes, la langue) ; la recherche et les
// trois familles (plats, boissons, desserts) restent à portée pendant le défilement. La carte s'ouvre dans la langue du téléphone.
import {
  Clock3,
  EllipsisVertical,
  type LucideIcon,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formaterPrix, sansAccents } from "@/lib/format";
import { traducteurClient } from "@/lib/i18n/client";
import {
  choisirTraduction,
  estLangueClient,
  FICHES_LANGUES,
  type LangueClient,
} from "@/lib/langues";
import type { CategorieVue } from "@/lib/types";
import { ArticleCarte, texteArticle } from "./ArticleCarte";
import { Feuillages } from "./Feuillages";
import { horairesLisibles } from "./horaires";
import { FeuilleMenu } from "./FeuilleMenu";
import { FeuillePanier } from "./FeuillePanier";
import { FeuillePlat, type PlatOuvert } from "./FeuillePlat";
import { FeuilleSuivi } from "./FeuilleSuivi";
import {
  FAMILLES,
  type FamilleRubrique,
  familleRubrique,
} from "./familles-rubriques";
import { useTable } from "./useTable";

type Proprietes = {
  jeton: string;
  numeroTable: string;
  devise: string;
  categories: CategorieVue[];
};

export function MenuTable({
  jeton,
  numeroTable,
  devise,
  categories,
}: Proprietes) {
  const [langue, setLangue] = useState<LangueClient>("fr");
  const t = useMemo(() => traducteurClient(langue), [langue]);
  const table = useTable({ jeton, langue });
  const [feuille, setFeuille] = useState<"menu" | "panier" | "suivi" | null>(
    null,
  );
  // Fiche du plat touché sur la carte
  const [plat, setPlat] = useState<PlatOuvert | null>(null);
  const [recherche, setRecherche] = useState("");
  // Famille choisie dans le bandeau ; null : la première proposée (les plats, d'ordinaire)
  const [famille, setFamille] = useState<FamilleRubrique | null>(null);

  // Langue : la première langue du téléphone proposée par la carte (dans l'ordre de ses
  // préférences), sinon le français ; rien à choisir pour le client
  useEffect(() => {
    const telephone = (
      navigator.languages?.length ? navigator.languages : [navigator.language]
    )
      .map((code) => code?.slice(0, 2).toLowerCase())
      .find(estLangueClient);
    setLangue(telephone ?? "fr");
  }, []);
  useEffect(() => {
    document.documentElement.lang = langue;
    document.documentElement.dir = FICHES_LANGUES[langue].sens;
  }, [langue]);

  const articles = useMemo(
    () =>
      new Map(
        categories
          .flatMap((categorie) => categorie.articles)
          .map((article) => [article.id, article]),
      ),
    [categories],
  );
  const lignes = Object.entries(table.panier).flatMap(([id, quantite]) => {
    const article = articles.get(id);
    return article && quantite > 0 ? [{ article, quantite }] : [];
  });
  const nombre = lignes.reduce((somme, { quantite }) => somme + quantite, 0);
  const total = lignes.reduce(
    (somme, { article, quantite }) => somme + article.prix * quantite,
    0,
  );

  const enCours = table.commandes.filter(
    (commande) =>
      commande.statut === "ENVOYEE" || commande.statut === "ACCEPTEE",
  ).length;

  const nomCategorie = (categorie: CategorieVue) =>
    choisirTraduction(categorie.traductions, langue, { nom: categorie.nom })
      .nom;

  // Familles présentes sur la carte : un restaurant sans dessert n'affiche pas l'onglet
  const familles = FAMILLES.filter(({ famille: candidate }) =>
    categories.some(
      (categorie) => familleRubrique(categorie.nom) === candidate,
    ),
  );
  const familleActive = famille ?? familles[0]?.famille;

  // Recherche dans la langue du client et en français (langue de la carte), sur toute la carte ;
  // sans recherche, les rubriques de la famille choisie
  const requete = sansAccents(recherche.trim());
  const categoriesAffichees = requete
    ? categories
        .map((categorie) => ({
          ...categorie,
          articles: categorie.articles.filter((article) => {
            const { nom, description } = texteArticle(article, langue);
            return sansAccents(
              [
                nom,
                description,
                article.nom,
                article.description,
                nomCategorie(categorie),
              ]
                .filter(Boolean)
                .join(" "),
            ).includes(requete);
          }),
        }))
        .filter((categorie) => categorie.articles.length > 0)
    : categories.filter(
        (categorie) => familleRubrique(categorie.nom) === familleActive,
      );

  const choisirFamille = (choisie: FamilleRubrique) => {
    setFamille(choisie);
    setRecherche("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rubriques = categoriesAffichees.map((categorie) => {
    const horaires = horairesLisibles(categorie.horaires, langue, t);
    return (
      <section key={categorie.id} className="pt-5 first:pt-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-1 pb-2.5">
          <h2 className="texte-titre-rubrique">{nomCategorie(categorie)}</h2>
          {horaires && (
            <span className="texte-horaires flex shrink-0 items-center gap-1">
              <Clock3 className="size-3.5" strokeWidth={2.2} aria-hidden />
              <span dir="ltr">{horaires}</span>
            </span>
          )}
        </div>
        <ul className="space-y-3">
          {categorie.articles.map((article) => (
            <ArticleCarte
              key={article.id}
              article={article}
              quantite={table.panier[article.id] ?? 0}
              devise={devise}
              langue={langue}
              t={t}
              onChanger={(ecart) => table.changerQuantite(article.id, ecart)}
              onOuvrir={() =>
                setPlat({
                  article,
                  rubrique: nomCategorie(categorie),
                  horaires,
                })
              }
            />
          ))}
        </ul>
      </section>
    );
  });

  return (
    <div
      lang={langue}
      dir={FICHES_LANGUES[langue].sens}
      className="relative min-h-dvh overflow-x-clip pb-32"
    >
      <Feuillages />

      {/* En-tête : le logo, et le bouton des services de la table (les trois points « plus d'options », noirs
          dans son rond blanc) ; la pastille compte les commandes en cours et les appels envoyés */}
      <header className="relative mx-auto flex max-w-xl items-center justify-between gap-3 px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logos/logo-restaurant.svg"
          alt="Restaurant"
          className="h-10 w-auto min-w-0 shrink object-contain object-left"
        />
        <button
          type="button"
          onClick={() => setFeuille("menu")}
          aria-label={t("menu")}
          aria-haspopup="dialog"
          className="relative grid size-12 shrink-0 place-items-center rounded-full bg-surface text-black shadow-[0_1px_2px_rgb(60_40_20/0.08),0_8px_18px_-10px_rgb(60_40_20/0.35)] ring-1 ring-black/5 transition active:scale-90"
        >
          <EllipsisVertical className="size-[26px]" strokeWidth={2.8} />
          {(enCours > 0 || table.appels.length > 0) && (
            <span className="absolute -end-1 -top-1 grid h-[22px] min-w-[22px] place-items-center rounded-full border-2 border-fond bg-alerte px-1 text-[11.5px] leading-none font-bold text-white tabular-nums">
              {enCours + table.appels.length}
            </span>
          )}
        </button>
      </header>

      {/* Recherche et rubriques : collées en haut pendant le défilement */}
      <div className="sticky top-0 z-20 bg-fond/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto max-w-xl px-5 pt-2">
          {/* Texte à 16 px : pas de zoom automatique sur iPhone */}
          <label className="flex h-10 items-center gap-2.5 rounded-full border border-accent-doux bg-surface ps-4 pe-1.5 shadow-[0_1px_2px_rgb(60_40_20/0.05)] transition focus-within:border-accent">
            <Search
              className="size-[18px] shrink-0 text-encre-douce"
              strokeWidth={2.3}
              aria-hidden
            />
            <input
              type="search"
              value={recherche}
              onChange={(evenement) => {
                setRecherche(evenement.target.value);
                window.scrollTo({ top: 0 });
              }}
              placeholder={t("placeholderRecherche")}
              aria-label={t("rechercher")}
              enterKeyHint="search"
              className="texte-recherche min-w-0 flex-1 bg-transparent outline-none placeholder:text-encre-pale [&::-webkit-search-cancel-button]:hidden"
            />
            {recherche && (
              <button
                type="button"
                onClick={() => setRecherche("")}
                aria-label={t("fermerRecherche")}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-creux text-encre-douce transition active:scale-90"
              >
                <X className="size-4" strokeWidth={2.6} />
              </button>
            )}
          </label>
        </div>

        {/* Les trois familles, côte à côte sur toute la largeur ; la choisie est remplie */}
        <nav
          aria-label={t("rubriques")}
          className="mx-auto flex max-w-xl gap-2 px-5 py-3"
        >
          {familles.map(({ famille: candidate, icone }) => (
            <PastilleRubrique
              key={candidate}
              icone={icone}
              libelle={t(`famille_${candidate}`)}
              active={candidate === familleActive && !requete}
              onClick={() => choisirFamille(candidate)}
            />
          ))}
        </nav>
      </div>

      <main className="relative mx-auto max-w-xl px-4 pt-1">
        {categoriesAffichees.length === 0 && (
          <p className="pt-12 text-center text-[14.5px] text-encre-pale">
            {t("aucunResultat", { q: recherche.trim() })}
          </p>
        )}

        {rubriques}
      </main>

      {/* Panier : toujours sous le pouce dès le premier article */}
      {nombre > 0 && (
        <div className="marge-securite-bas fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-fond via-fond/95 to-fond/0 px-5 pt-6">
          <button
            type="button"
            onClick={() => setFeuille("panier")}
            className="mx-auto flex h-14 w-full max-w-xl animate-apparition items-center gap-3 rounded-full bg-bouton ps-2.5 pe-6 text-texte-bouton shadow-carte transition active:scale-[0.98]"
          >
            <span className="grid h-9 min-w-9 place-items-center rounded-full bg-texte-bouton/20 px-1.5 text-[14px] font-bold tabular-nums">
              {nombre}
            </span>
            <span className="texte-barre-commande flex-1 text-start">
              {t("voirCommande")}
            </span>
            <span className="texte-barre-commande tabular-nums">
              {formaterPrix(total, devise, langue)}
            </span>
          </button>
        </div>
      )}

      <FeuilleMenu
        ouverte={feuille === "menu"}
        titre={t("table", { n: numeroTable })}
        t={t}
        appels={table.appels}
        commandes={table.commandes.length}
        enCours={enCours}
        onAppeler={table.appeler}
        onSuivi={() => setFeuille("suivi")}
        onFermer={() => setFeuille(null)}
      />
      <FeuillePanier
        ouverte={feuille === "panier"}
        lignes={lignes}
        nombre={nombre}
        total={total}
        devise={devise}
        langue={langue}
        t={t}
        table={table}
        onFermer={() => setFeuille(null)}
        onEnvoyee={() => setFeuille("suivi")}
      />
      <FeuilleSuivi
        ouverte={feuille === "suivi"}
        commandes={table.commandes}
        devise={devise}
        langue={langue}
        t={t}
        onAnnuler={table.annuler}
        onFermer={() => setFeuille(null)}
      />
      <FeuillePlat
        plat={plat}
        dejaCommandes={plat ? (table.panier[plat.article.id] ?? 0) : 0}
        devise={devise}
        langue={langue}
        t={t}
        onAjouter={(quantite) => {
          if (plat) table.changerQuantite(plat.article.id, quantite);
          setPlat(null);
        }}
        onFermer={() => setPlat(null)}
      />
    </div>
  );
}

/** Une famille du bandeau : icône et nom ; remplie couleur des boutons quand elle est choisie. */
function PastilleRubrique({
  icone: Icone,
  libelle,
  active,
  onClick,
}: {
  icone: LucideIcon;
  libelle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`texte-rubriques flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 transition active:scale-95 ${
        active ? "bg-bouton" : "bg-accent-doux"
      }`}
    >
      <Icone
        className={`size-[18px] shrink-0 ${active ? "" : "text-bouton"}`}
        strokeWidth={2.2}
        aria-hidden
      />
      <span className="truncate">{libelle}</span>
    </button>
  );
}
