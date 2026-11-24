"use client";

// « Restaurant » : les trois barres de la barre du haut (comme le menu côté client), sur toutes les
// pages ; elles ouvrent, en haut, un écran temporaire avec tables, carte et paramètres. Choisir une
// destination ferme cet écran et ouvre sa page temporaire sur l'accueil (tout de suite si on y est).
import {
  BookOpenText,
  LayoutGrid,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Fiche } from "./Fiche";
import { Pastille } from "./Pastille";

export type DestinationRestaurant = {
  cle: "tables" | "carte" | "parametres";
  libelle: string;
  notifications: number;
};

const ICONES: Record<DestinationRestaurant["cle"], LucideIcon> = {
  tables: LayoutGrid,
  carte: BookOpenText,
  parametres: Settings,
};

/** Événement écouté par l'accueil : ouvrir une page temporaire sans attendre le serveur. */
export const EVENEMENT_PAGE = "tabla:page";

export function EcranRestaurant({
  libelle,
  libelleFermer,
  destinations,
}: {
  libelle: string;
  libelleFermer: string;
  destinations: DestinationRestaurant[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const chemin = usePathname();
  const total = destinations.reduce(
    (somme, { notifications }) => somme + notifications,
    0,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-haspopup="dialog"
        aria-label={libelle}
        title={libelle}
        className="relative grid size-11 shrink-0 place-items-center rounded-full bg-surface text-black shadow-[0_1px_2px_rgb(26_27_23/0.06),0_8px_20px_-12px_rgb(26_27_23/0.35)] transition active:scale-90"
      >
        {/* Les mêmes trois barres que chez le client */}
        <svg
          viewBox="0 0 24 24"
          className="size-[30px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M3 5h18M3 12h18M3 19h18" />
        </svg>
        <Pastille
          nombre={total}
          className="absolute -end-1.5 -top-1.5 border-white"
        />
      </button>
      {ouvert && (
        <Fiche
          libelle={libelle}
          libelleFermer={libelleFermer}
          onFermer={() => setOuvert(false)}
          enHaut
        >
          <h2 className="texte-sous-titres-equipe px-10 text-center text-sous-titres-equipe">
            {libelle}
          </h2>
          <nav aria-label={libelle} className="pt-7 pb-7">
            <ul className="flex justify-center gap-9 sm:gap-14">
              {destinations.map(({ cle, libelle: nom, notifications }) => {
                const Icone = ICONES[cle];
                return (
                  <li key={cle}>
                    <Link
                      href={`/espace/accueil?page=${cle}`}
                      onClick={(evenement) => {
                        setOuvert(false);
                        // Déjà sur l'accueil : la page temporaire s'ouvre sans attendre
                        if (chemin === "/espace/accueil") {
                          evenement.preventDefault();
                          window.dispatchEvent(
                            new CustomEvent(EVENEMENT_PAGE, { detail: cle }),
                          );
                        }
                      }}
                      className="group flex flex-col items-center gap-2 text-center"
                    >
                      <span className="relative grid size-16 place-items-center rounded-full border border-ligne bg-cercle text-icone-cercle shadow-carte transition duration-200 group-hover:-translate-y-0.5 group-hover:border-encre/25 group-active:scale-95">
                        <Icone
                          className="size-[26px]"
                          strokeWidth={2.3}
                          aria-hidden
                        />
                        <Pastille
                          nombre={notifications}
                          className="absolute -end-1 -top-1 border-fond"
                        />
                      </span>
                      <span className="texte-tuiles-equipe line-clamp-2 max-w-24 break-words text-texte-cercle">
                        {nom}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Fiche>
      )}
    </>
  );
}
