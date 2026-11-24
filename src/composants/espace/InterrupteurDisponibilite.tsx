"use client";

// Disponibilité d'un article : interrupteur marche / arrêt. Le nouvel état s'affiche aussitôt
// (optimiste), puis la carte des clients se met à jour côté serveur.
import { useOptimistic } from "react";
import { basculerDisponibilite } from "@/app/espace/actions";

export function InterrupteurDisponibilite({
  articleId,
  disponible,
  libelles,
}: {
  articleId: string;
  disponible: boolean;
  libelles: { disponible: string; indisponible: string };
}) {
  const [actif, afficher] = useOptimistic(
    disponible,
    (_etat, valeur: boolean) => valeur,
  );
  const libelle = actif ? libelles.disponible : libelles.indisponible;

  return (
    <form
      action={async (formulaire) => {
        afficher(!actif);
        await basculerDisponibilite(formulaire);
      }}
    >
      <input type="hidden" name="articleId" value={articleId} />
      {/* L'état voulu, pas « l'inverse de l'actuel » : deux gestes simultanés ne s'annulent pas */}
      <input type="hidden" name="disponible" value={actif ? "non" : "oui"} />
      <button
        role="switch"
        aria-checked={actif}
        aria-label={libelle}
        title={libelle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-offset-2 ${
          actif ? "bg-interrupteur" : "bg-interrupteur-arret"
        }`}
      >
        <span
          aria-hidden
          className={`size-6 rounded-full bg-white shadow-[0_1px_3px_rgb(26_27_23/0.25)] transition-transform duration-200 ease-out ${
            actif ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </form>
  );
}
