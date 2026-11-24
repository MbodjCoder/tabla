// Navigation par onglets de l'espace de l'équipe (Commandes, Carte, Tables), au même style que
// les onglets Wi-Fi · Horaires · Départ du client : fond gris, onglet actif blanc en relief.
// Liens d'adresse (?vue=…) : aucun JavaScript requis, l'onglet survit au rafraîchissement.
import Link from "next/link";

export type OngletSegmente = {
  cle: string;
  libelle: string;
  href: string;
  nombre?: number; // pastille ; absente pour une simple navigation
  nouveau?: boolean; // point rouge : notification (nouvel avis)
  sansPrechargement?: boolean; // l'ouverture a un effet (avis marqués comme vus)
};

export function OngletsSegmentes({
  onglets,
  actif,
  defilant = false,
  nombresEnAlerte = false,
  libelleNouveau,
}: {
  onglets: OngletSegmente[];
  actif: string;
  defilant?: boolean; // nombreux onglets (catégories de la carte) : défilement horizontal
  nombresEnAlerte?: boolean; // nombres de notifications : pastilles rouges
  libelleNouveau?: string;
}) {
  return (
    <nav
      className={`rounded-full bg-fond-onglets p-1 ${
        defilant
          ? "defilement-discret flex gap-1 overflow-x-auto"
          : "flex gap-1"
      }`}
    >
      {onglets.map((onglet) => {
        const estActif = onglet.cle === actif;
        return (
          <Link
            key={onglet.cle}
            href={onglet.href}
            replace
            scroll={false}
            prefetch={onglet.sansPrechargement ? false : undefined}
            aria-current={estActif ? "page" : undefined}
            className={`texte-boutons-equipe relative flex h-10 min-w-0 items-center justify-center gap-1 rounded-full whitespace-nowrap transition duration-200 sm:gap-1.5 sm:px-4 ${
              defilant ? "shrink-0 px-3.5" : "flex-1 basis-0 px-2"
            } ${estActif ? "bg-onglet-actif text-texte-onglet-actif shadow-carte" : "text-encre-douce hover:text-encre"}`}
          >
            <span className={defilant ? "" : "truncate"}>{onglet.libelle}</span>
            {onglet.nombre !== undefined && (
              <span
                className={`texte-etiquettes-equipe grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full px-1 tabular-nums sm:h-5 sm:min-w-5 sm:px-1.5 ${
                  // Notifications : pastille sur le coin de l'onglet, le libellé garde toute sa place
                  nombresEnAlerte && onglet.nombre > 0
                    ? "absolute -end-0.5 -top-1.5 border-2 border-fond-onglets bg-pastilles text-texte-pastilles"
                    : `relative ${onglet.nombre > 0 ? "bg-bouton text-texte-bouton" : "bg-encre/10 text-encre-douce"}`
                }`}
              >
                {onglet.nombre}
                {onglet.nouveau && (
                  <span
                    className="absolute -end-1 -top-1 size-2.5 rounded-full bg-alerte ring-2 ring-fond-onglets"
                    aria-label={libelleNouveau}
                  />
                )}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
