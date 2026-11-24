// Contenu de la page temporaire « Carte » (accueil, ?page=carte).
// Carte et services : ce que les clients peuvent commander. Le design est celui de l'espace de Lalla.
// Onglets Disponibles · Indisponibles ; filtre par catégorie et recherche d'un article.
// Réception : rendre un article indisponible en un geste (rupture en cuisine).
// Direction : toucher un article pour le modifier ou le supprimer ; ajouter.
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { InterrupteurDisponibilite } from "@/composants/espace/InterrupteurDisponibilite";
import { OngletsSegmentes } from "@/composants/espace/OngletsSegmentes";
import { OutilsCarte } from "@/composants/espace/OutilsCarte";
import { bdd } from "@/lib/bdd";
import { formaterPrix, sansAccents } from "@/lib/format";
import type { TraduireEquipe } from "@/lib/i18n/equipe";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { exigerPersonnel } from "@/lib/session-personnel";
import {
  enregistrerArticle,
  enregistrerCategorie,
  supprimerArticle,
  toutValiderCarte,
} from "@/app/espace/actions";

const CHAMP =
  "texte-champs-equipe h-11 w-full rounded-xl border border-ligne bg-fond px-3 outline-none transition focus:border-encre text-champs-equipe";

type Vue = "disponibles" | "indisponibles";

export async function ContenuCarte({
  parametres,
}: {
  parametres: { vue?: string; categorie?: string; q?: string };
}) {
  const { etablissementId, role } = await exigerPersonnel();
  const direction = role === "DIRECTION";
  const etablissement = await bdd.etablissement.findUniqueOrThrow({
    where: { id: etablissementId },
    select: { langueEquipe: true, devise: true },
  });
  const { langue, t } = await traducteurEquipeCourant(
    etablissement.langueEquipe,
  );
  const categories = await bdd.categorieCatalogue.findMany({
    where: { etablissementId },
    orderBy: [{ ordre: "asc" }, { id: "asc" }],
    include: { articles: { orderBy: [{ ordre: "asc" }, { id: "asc" }] } },
  });

  const aVerifier = categories.some(
    (c) => c.aVerifier || c.articles.some((a) => a.aVerifier),
  );
  // Nom dans la langue de l'équipe (traductions de la carte : les 8 langues des clients)
  const traduire = (traductions: unknown, nomFr: string) =>
    langue === "fr"
      ? nomFr
      : ((traductions as Record<string, { nom?: string }>)[langue]?.nom ??
        nomFr);
  const vue: Vue =
    parametres.vue === "indisponibles" ? "indisponibles" : "disponibles";
  const categorieChoisie = categories.find(
    (c) => c.id === parametres.categorie,
  );
  const requete = sansAccents(parametres.q?.trim() ?? "");
  // Catégorie et recherche d'abord ; l'onglet trie ensuite selon la disponibilité
  const correspondantes = (
    categorieChoisie ? [categorieChoisie] : categories
  ).map((categorie) => ({
    ...categorie,
    articles: categorie.articles.filter((article) => {
      if (!requete) return true;
      const traduction = (
        article.traductions as Record<
          string,
          { nom?: string; description?: string }
        >
      )[langue];
      return sansAccents(
        [
          article.nom,
          article.description,
          traduction?.nom,
          traduction?.description,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(requete);
    }),
  }));
  const nombre = (disponible: boolean) =>
    correspondantes.reduce(
      (total, c) =>
        total + c.articles.filter((a) => a.disponible === disponible).length,
      0,
    );
  const categoriesAffichees = correspondantes
    .map((categorie) => ({
      ...categorie,
      articles: categorie.articles.filter(
        (article) => article.disponible === (vue === "disponibles"),
      ),
    }))
    // Sans filtre, toutes les catégories restent visibles (la direction peut y ajouter un article)
    .filter(
      (categorie) =>
        categorie.articles.length > 0 || (vue === "disponibles" && !requete),
    );
  // Lien d'onglet qui conserve la catégorie et la recherche en cours
  const lienVue = (cle: Vue) => {
    const suivants = new URLSearchParams();
    suivants.set("page", "carte");
    suivants.set("vue", cle);
    if (categorieChoisie) suivants.set("categorie", categorieChoisie.id);
    if (parametres.q?.trim()) suivants.set("q", parametres.q.trim());
    return `?${suivants}`;
  };

  return (
    <>
      {aVerifier && direction && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-[20px] border border-accent/40 bg-accent-pale px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
          <p className="texte-courant-equipe min-w-0 flex-1 leading-relaxed text-courant-equipe">
            {t("modeleParDefaut")}
          </p>
          <form action={toutValiderCarte}>
            <button className="texte-boutons-equipe flex h-11 items-center gap-2 rounded-xl bg-bouton px-4 text-texte-bouton">
              <Check className="size-4" strokeWidth={2.5} />
              {t("toutValider")}
            </button>
          </form>
        </div>
      )}

      {/* Disponibles · Indisponibles, puis catégorie et recherche */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-[26rem]">
          <OngletsSegmentes
            actif={vue}
            onglets={(
              [
                ["disponibles", t("ongletDisponibles")],
                ["indisponibles", t("ongletIndisponibles")],
              ] as const
            ).map(([cle, libelle]) => ({
              cle,
              libelle,
              href: lienVue(cle),
              nombre: nombre(cle === "disponibles"),
            }))}
          />
        </div>
        <OutilsCarte
          categories={categories.map((categorie) => ({
            id: categorie.id,
            nom: traduire(categorie.traductions, categorie.nom),
          }))}
          libelles={{
            toutesCategories: t("toutesCategories"),
            categorie: t("categorie"),
            rechercher: t("rechercher"),
            rechercherArticle: t("rechercherArticle"),
            fermerRecherche: t("fermerRecherche"),
          }}
        />
      </div>

      {categoriesAffichees.length === 0 && (
        <p className="texte-details-equipe mt-5 rounded-[24px] border border-ligne bg-surface px-5 py-8 text-center text-details-equipe">
          {t("aucunArticle")}
        </p>
      )}

      <div className="mt-5 space-y-5">
        {categoriesAffichees.map((categorie) => (
          <section
            key={categorie.id}
            className="rounded-[24px] border border-ligne bg-surface p-5 shadow-carte"
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {/* Plus appuyé, même police : Instrument Serif n'a qu'une graisse, un léger contour l'épaissit */}
                <h2 className="texte-sous-titres-equipe leading-tight text-sous-titres-equipe">
                  {traduire(categorie.traductions, categorie.nom)}
                </h2>
                {categorie.horaires && (
                  <p className="texte-details-equipe mt-1 text-details-equipe">
                    {categorie.horaires}
                  </p>
                )}
              </div>
              {categorie.aVerifier && <Pastille texte={t("aVerifier")} />}
            </header>

            {direction && (
              <details className="group mt-2">
                <summary
                  aria-label={t("modifier")}
                  title={t("modifier")}
                  className="inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-creux text-encre-douce transition hover:text-encre group-open:bg-bouton/10 group-open:text-bouton [&::-webkit-details-marker]:hidden"
                >
                  <Pencil className="size-4" />
                </summary>
                <form
                  action={enregistrerCategorie}
                  className="mt-3 grid gap-2 sm:grid-cols-2"
                >
                  <input
                    type="hidden"
                    name="categorieId"
                    value={categorie.id}
                  />
                  <label className="texte-libelles-equipe text-libelles-equipe">
                    {t("horaires")}
                    <input
                      name="horaires"
                      defaultValue={categorie.horaires ?? ""}
                      className={`${CHAMP} mt-1`}
                    />
                  </label>
                  <button className="texte-boutons-equipe h-11 rounded-xl bg-bouton px-4 text-texte-bouton sm:col-span-2 sm:justify-self-start">
                    {t("enregistrer")}
                  </button>
                </form>
              </details>
            )}

            <ul className="mt-4 divide-y divide-ligne">
              {categorie.articles.map((article) => {
                const apercu = (
                  <>
                    {article.photo && (
                      // eslint-disable-next-line @next/next/no-img-element -- photo locale ou lien libre de l'établissement
                      <img
                        src={article.photo}
                        alt=""
                        loading="lazy"
                        className={`size-14 shrink-0 rounded-xl bg-creux object-cover ${article.disponible ? "" : "opacity-50 grayscale"}`}
                      />
                    )}
                    <div
                      className={`min-w-0 flex-1 ${article.disponible ? "" : "opacity-50"}`}
                    >
                      <p className="texte-textes-equipe flex flex-wrap items-center gap-2 text-textes-equipe">
                        {traduire(article.traductions, article.nom)}
                        {article.aVerifier && direction && (
                          <Pastille texte={t("aVerifier")} />
                        )}
                      </p>
                      {article.description && (
                        <p className="texte-details-equipe mt-0.5 line-clamp-1 leading-snug text-details-equipe">
                          {article.description}
                        </p>
                      )}
                      <p className="texte-libelles-equipe mt-0.5 tabular-nums text-libelles-equipe">
                        {formaterPrix(
                          article.prix,
                          etablissement.devise,
                          langue,
                        )}
                      </p>
                    </div>
                  </>
                );
                return (
                  <li key={article.id} className="relative py-3">
                    {/* Direction : toucher l'article ouvre sa fiche ; l'interrupteur reste à portée, hors de la fiche */}
                    {direction ? (
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl pe-16 transition [&::-webkit-details-marker]:hidden">
                          {apercu}
                        </summary>
                        <FormulaireArticle
                          t={t}
                          articleId={article.id}
                          valeurs={article}
                        />
                        <form action={supprimerArticle} className="mt-2">
                          <input
                            type="hidden"
                            name="articleId"
                            value={article.id}
                          />
                          <button className="texte-boutons-equipe inline-flex h-10 items-center gap-1.5 text-alerte">
                            <Trash2 className="size-4" /> {t("supprimer")}
                          </button>
                        </form>
                      </details>
                    ) : (
                      <div className="flex items-start gap-3 pe-16">
                        {apercu}
                      </div>
                    )}
                    <div className="absolute end-0 top-3">
                      <InterrupteurDisponibilite
                        articleId={article.id}
                        disponible={article.disponible}
                        libelles={{
                          disponible: t("disponible"),
                          indisponible: t("indisponible"),
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Un nouvel article est disponible : il s'ajoute depuis l'onglet Disponibles */}
            {direction && vue === "disponibles" && (
              <details className="mt-3 border-t border-ligne pt-3">
                <summary className="texte-boutons-equipe inline-flex cursor-pointer list-none items-center gap-1.5 text-encre">
                  <Plus className="size-4" /> {t("ajouterArticle")}
                </summary>
                <FormulaireArticle t={t} categorieId={categorie.id} />
              </details>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

function Pastille({ texte }: { texte: string }) {
  return (
    <span className="texte-etiquettes-equipe rounded-full bg-accent-pale px-2.5 py-0.5 uppercase text-accent-profond">
      {texte}
    </span>
  );
}

function FormulaireArticle({
  t,
  articleId,
  categorieId,
  valeurs,
}: {
  t: TraduireEquipe;
  articleId?: string;
  categorieId?: string;
  valeurs?: {
    nom: string;
    description: string | null;
    prix: number;
    photo: string | null;
  };
}) {
  return (
    <form
      action={enregistrerArticle}
      className="mt-3 grid gap-2 sm:grid-cols-[1fr_9rem]"
    >
      {articleId && <input type="hidden" name="articleId" value={articleId} />}
      {categorieId && (
        <input type="hidden" name="categorieId" value={categorieId} />
      )}
      <input
        name="nom"
        required
        minLength={2}
        placeholder={t("nomArticle")}
        defaultValue={valeurs?.nom}
        className={CHAMP}
      />
      <input
        name="prix"
        type="number"
        required
        min={0}
        step={500}
        inputMode="numeric"
        placeholder={t("prix")}
        aria-label={t("prix")}
        defaultValue={valeurs?.prix}
        className={CHAMP}
      />
      <input
        name="description"
        placeholder={t("description")}
        defaultValue={valeurs?.description ?? ""}
        className={`${CHAMP} sm:col-span-2`}
      />
      <input
        name="photo"
        type="text"
        inputMode="url"
        pattern="(https:\/\/\S+|\/images\/[\w\/.\-]+)"
        placeholder={t("photoArticle")}
        aria-label={t("photoArticle")}
        defaultValue={valeurs?.photo ?? ""}
        className={`${CHAMP} sm:col-span-2`}
      />
      <button className="texte-boutons-equipe h-11 rounded-xl bg-bouton px-4 text-texte-bouton sm:justify-self-start">
        {t("enregistrer")}
      </button>
    </form>
  );
}
