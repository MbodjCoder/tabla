"use client";

// Tableau de bord de l'accueil : nouvelles commandes, en cours et appels, trois rubriques posées à même
// la page, chacune avec son nombre en pastille. Chacune ouvre sa page temporaire pour tout gérer sans
// quitter l'accueil, comme tables, carte et paramètres (depuis ☰) ; elle s'ouvre tout de suite, son
// contenu suit. L'adresse (?page=…) la garde ouverte au rafraîchissement. Le design est celui de Lalla.
import {
  BellRing,
  ChefHat,
  ClipboardList,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EVENEMENT_PAGE } from "./EcranRestaurant";
import { Fiche } from "./Fiche";
import { Pastille } from "./Pastille";

export type CleService = "nouvelles" | "preparation" | "appels";
export type PageTemporaire = CleService | "tables" | "carte" | "parametres";
export type DetailService = {
  cle: CleService;
  libelle: string;
  nombre: number;
};

const ICONES: Record<CleService, LucideIcon> = {
  nouvelles: ClipboardList,
  preparation: ChefHat,
  appels: BellRing,
};

export function TableauService({
  details,
  titres,
  pageOuverte,
  libelleFermer,
  children,
}: {
  details: DetailService[];
  titres: Record<PageTemporaire, string>;
  pageOuverte: PageTemporaire | null; // page temporaire rendue par le serveur (son contenu : children)
  libelleFermer: string;
  children?: React.ReactNode;
}) {
  const routeur = useRouter();
  const [ouverte, setOuverte] = useState<PageTemporaire | null>(pageOuverte);
  // Le dernier geste (ouvrir, fermer) en attente de la réponse du serveur ; undefined : aucun
  const voulu = useRef<PageTemporaire | null | undefined>(undefined);

  const aller = useCallback(
    (cle: PageTemporaire | null) =>
      startTransition(() =>
        routeur.replace(
          cle ? `/espace/accueil?page=${cle}` : "/espace/accueil",
          { scroll: false },
        ),
      ),
    [routeur],
  );

  useEffect(() => {
    // Une alerte ou une autre page ouvre une page temporaire depuis l'adresse ; la réponse
    // attendue confirme le dernier geste
    if (voulu.current === undefined || voulu.current === pageOuverte) {
      voulu.current = undefined;
      setOuverte(pageOuverte);
      return;
    }
    // Réponse périmée (ouverte puis fermée avant qu'elle n'arrive) : l'adresse suit le dernier geste
    aller(voulu.current);
  }, [pageOuverte, aller]);

  const ouvrir = useCallback(
    (cle: PageTemporaire) => {
      voulu.current = cle;
      setOuverte(cle);
      aller(cle);
    },
    [aller],
  );

  // ☰ (barre du haut) ouvre tables, carte ou paramètres sans attendre
  useEffect(() => {
    const ecouter = (evenement: Event) =>
      ouvrir((evenement as CustomEvent<PageTemporaire>).detail);
    window.addEventListener(EVENEMENT_PAGE, ecouter);
    return () => window.removeEventListener(EVENEMENT_PAGE, ecouter);
  }, [ouvrir]);
  const fermer = useCallback(() => {
    voulu.current = null;
    setOuverte(null);
    aller(null);
  }, [aller]);

  return (
    <section>
      {/* Nouvelles, en cours, appels : chacune ouvre sa page temporaire. Sur téléphone, une rubrique par
          ligne (grande icône, grand nom, nombre au bout) ; dès la tablette, les trois côte à côte */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {details.map(({ cle, libelle, nombre }) => {
          const Icone = ICONES[cle];
          return (
            <li key={cle}>
              <button
                type="button"
                onClick={() => ouvrir(cle)}
                aria-haspopup="dialog"
                className="relative flex h-24 w-full items-center gap-5 rounded-[24px] bg-bouton-tableau px-6 text-start shadow-flottante transition hover:opacity-90 active:scale-[0.98] sm:h-auto sm:aspect-[4/3] sm:flex-col sm:justify-center sm:gap-4 sm:px-2 sm:text-center"
              >
                <Icone
                  className="size-12 shrink-0 text-icone-bouton-tableau sm:size-14"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="texte-rubriques-tableau min-w-0 flex-1 truncate text-texte-bouton-tableau sm:w-full sm:flex-none">
                  {libelle}
                </span>
                <Pastille
                  nombre={nombre}
                  className="h-11 min-w-11 border-transparent px-3 text-[20px] sm:absolute sm:-end-2 sm:-top-2 sm:h-9 sm:min-w-9 sm:border-fond sm:px-2 sm:text-[17px]"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {ouverte && (
        <Fiche
          libelle={titres[ouverte]}
          libelleFermer={libelleFermer}
          onFermer={fermer}
          grande
        >
          <h2 className="texte-sous-titres-equipe px-10 text-center text-titres-equipe">
            {titres[ouverte]}
          </h2>
          <div className="mt-6 pb-6 text-start">
            {ouverte === pageOuverte && children ? (
              children
            ) : (
              <p
                className="flex justify-center py-16 text-encre-pale"
                role="status"
              >
                <Loader2 className="size-7 animate-spin" aria-hidden />
              </p>
            )}
          </div>
        </Fiche>
      )}
    </section>
  );
}
