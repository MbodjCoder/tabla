"use client";

// Loupe qui se déplie en champ de recherche. La saisie est reportée dans l'adresse
// (?<parametre>=…) après un court délai : la page serveur filtre, l'état survit au rafraîchissement.
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Délai avant de lancer la recherche pendant la frappe
const DELAI_RECHERCHE_MS = 250;

export function RechercheDepliable({
  parametre,
  libelles,
}: {
  parametre: string;
  libelles: { rechercher: string; placeholder: string; fermer: string };
}) {
  const routeur = useRouter();
  const chemin = usePathname();
  const parametres = useSearchParams();
  const requeteActuelle = parametres.get(parametre) ?? "";
  const [ouverte, setOuverte] = useState(requeteActuelle !== "");
  const [texte, setTexte] = useState(requeteActuelle);

  function appliquer(valeur: string) {
    const suivants = new URLSearchParams(parametres.toString());
    if (valeur) suivants.set(parametre, valeur);
    else suivants.delete(parametre);
    const chaine = suivants.toString();
    routeur.replace(chaine ? `${chemin}?${chaine}` : chemin, { scroll: false });
  }

  // Recherche en direct, sans requête à chaque touche
  useEffect(() => {
    const valeur = texte.trim();
    if (valeur === requeteActuelle) return;
    const minuterie = setTimeout(() => appliquer(valeur), DELAI_RECHERCHE_MS);
    return () => clearTimeout(minuterie);
    // appliquer dépend des paramètres courants : seule la saisie déclenche la recherche
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texte]);

  if (!ouverte) {
    return (
      <button
        type="button"
        onClick={() => setOuverte(true)}
        aria-label={libelles.rechercher}
        title={libelles.rechercher}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-ligne bg-surface text-encre-douce shadow-carte transition hover:bg-creux hover:text-encre active:scale-95"
      >
        <Search className="size-[18px]" strokeWidth={2.2} />
      </button>
    );
  }

  return (
    <label className="flex h-10 w-full min-w-0 items-center gap-2 rounded-full border border-ligne bg-surface ps-4 pe-1 shadow-carte focus-within:border-encre/30 sm:w-72">
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
        placeholder={libelles.placeholder}
        aria-label={libelles.rechercher}
        className="texte-champs-equipe min-w-0 flex-1 bg-transparent outline-none placeholder:text-encre-pale [&::-webkit-search-cancel-button]:hidden text-champs-equipe"
      />
      <button
        type="button"
        onClick={() => {
          setTexte("");
          setOuverte(false);
          appliquer("");
        }}
        aria-label={libelles.fermer}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-creux text-encre-douce transition hover:text-encre active:scale-90"
      >
        <X className="size-4" strokeWidth={2.4} />
      </button>
    </label>
  );
}
