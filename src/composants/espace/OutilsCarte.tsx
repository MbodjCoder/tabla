"use client";

// Outils de la page Carte : filtre par catégorie (sélecteur natif, confortable sur téléphone)
// et recherche d'un article (la loupe se déplie en champ). L'état vit dans l'adresse
// (?categorie=…&q=…), comme les onglets Disponibles · Indisponibles.
import { ChevronDown, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Délai avant de lancer la recherche pendant la frappe
const DELAI_RECHERCHE_MS = 250;

type Libelles = {
  toutesCategories: string;
  categorie: string;
  rechercher: string;
  rechercherArticle: string;
  fermerRecherche: string;
};

export function OutilsCarte({
  categories,
  libelles,
}: {
  categories: { id: string; nom: string }[];
  libelles: Libelles;
}) {
  const routeur = useRouter();
  const chemin = usePathname();
  const parametres = useSearchParams();
  const requeteActuelle = parametres.get("q") ?? "";
  const [rechercheOuverte, setRechercheOuverte] = useState(
    requeteActuelle !== "",
  );
  const [texte, setTexte] = useState(requeteActuelle);

  function appliquer(cle: string, valeur: string) {
    const suivants = new URLSearchParams(parametres.toString());
    if (valeur) suivants.set(cle, valeur);
    else suivants.delete(cle);
    const chaine = suivants.toString();
    routeur.replace(chaine ? `${chemin}?${chaine}` : chemin, { scroll: false });
  }

  // Recherche en direct, sans requête à chaque touche
  useEffect(() => {
    const valeur = texte.trim();
    if (valeur === requeteActuelle) return;
    const minuterie = setTimeout(
      () => appliquer("q", valeur),
      DELAI_RECHERCHE_MS,
    );
    return () => clearTimeout(minuterie);
    // appliquer dépend des paramètres courants : seule la saisie déclenche la recherche
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texte]);

  function fermerRecherche() {
    setTexte("");
    setRechercheOuverte(false);
    appliquer("q", "");
  }

  if (rechercheOuverte) {
    return (
      <label className="flex h-10 w-full items-center gap-2 rounded-full border border-ligne bg-surface ps-4 pe-1 shadow-carte focus-within:border-encre/30 sm:w-80">
        <Search
          className="size-4 shrink-0 text-encre-pale"
          strokeWidth={2.2}
          aria-hidden
        />
        <input
          type="search"
          autoFocus
          value={texte}
          onChange={(evenement) => setTexte(evenement.target.value)}
          placeholder={libelles.rechercherArticle}
          aria-label={libelles.rechercher}
          className="texte-champs-equipe min-w-0 flex-1 bg-transparent outline-none placeholder:text-encre-pale [&::-webkit-search-cancel-button]:hidden text-champs-equipe"
        />
        <button
          type="button"
          onClick={fermerRecherche}
          aria-label={libelles.fermerRecherche}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-creux text-encre-douce transition hover:text-encre active:scale-90"
        >
          <X className="size-4" strokeWidth={2.4} />
        </button>
      </label>
    );
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <span className="relative min-w-0 flex-1 sm:flex-none">
        <select
          value={parametres.get("categorie") ?? ""}
          onChange={(evenement) =>
            appliquer("categorie", evenement.target.value)
          }
          aria-label={libelles.categorie}
          className="texte-champs-equipe h-10 w-full cursor-pointer appearance-none truncate rounded-full border border-ligne bg-surface ps-4 pe-9 shadow-carte outline-none transition hover:bg-creux focus:border-encre/30 sm:w-60 text-champs-equipe"
        >
          <option value="">{libelles.toutesCategories}</option>
          {categories.map((categorie) => (
            <option key={categorie.id} value={categorie.id}>
              {categorie.nom}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale"
          strokeWidth={2.2}
          aria-hidden
        />
      </span>
      <button
        type="button"
        onClick={() => setRechercheOuverte(true)}
        aria-label={libelles.rechercher}
        title={libelles.rechercher}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-ligne bg-surface text-encre-douce shadow-carte transition hover:bg-creux hover:text-encre active:scale-95"
      >
        <Search className="size-[18px]" strokeWidth={2.2} />
      </button>
    </div>
  );
}
