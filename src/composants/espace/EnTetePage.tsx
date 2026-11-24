import { ChevronLeft } from "lucide-react";
import Link from "next/link";

/**
 * En-tête d'une page : une flèche bien visible pour revenir et le titre centré, collés sous la
 * barre du haut quand on fait défiler (le retour reste toujours à portée de pouce).
 */
export function EnTetePage({
  retour,
  libelleRetour,
  titre,
  children,
}: {
  retour: string;
  libelleRetour: string;
  titre: string;
  children?: React.ReactNode; // sous le titre, centré (date…)
}) {
  return (
    <header className="sticky top-16 z-10 -mx-5 -mt-4 bg-fond/90 px-5 pt-3 pb-3 backdrop-blur-xl print:static">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-2">
        <Link
          href={retour}
          aria-label={libelleRetour}
          title={libelleRetour}
          className="grid size-12 place-items-center rounded-full border border-ligne bg-fleche text-icone-fleche shadow-carte transition hover:border-encre/25 active:scale-90"
        >
          <ChevronLeft
            className="size-7 rtl:-scale-x-100"
            strokeWidth={2.8}
            aria-hidden
          />
        </Link>
        <h1 className="texte-titres-equipe text-center text-balance text-titres-equipe">
          {titre}
        </h1>
      </div>
      {children && <div className="mt-1.5 text-center">{children}</div>}
    </header>
  );
}
