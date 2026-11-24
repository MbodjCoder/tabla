"use client";

// Page temporaire : feuille qui monte sur téléphone, fenêtre centrée ailleurs ; « en haut », elle
// descend sous le pouce, près du bouton qui l'ouvre ; « grande », elle tient une liste entière.
// Échap ou le voile la ferment ; la page derrière ne défile plus.
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Fiche({
  libelle,
  libelleFermer,
  onFermer,
  enHaut = false,
  grande = false,
  children,
}: {
  libelle: string;
  libelleFermer: string;
  onFermer: () => void;
  enHaut?: boolean;
  grande?: boolean;
  children: React.ReactNode;
}) {
  // Ouverte dès le chargement (lien direct) : elle s'affiche une fois la page montée, le serveur n'a pas de document
  const [montee, setMontee] = useState(false);
  useEffect(() => setMontee(true), []);

  useEffect(() => {
    const aLaTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") onFermer();
    };
    const debordement = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", aLaTouche);
    return () => {
      document.body.style.overflow = debordement;
      document.removeEventListener("keydown", aLaTouche);
    };
  }, [onFermer]);

  if (!montee) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={libelle}
      className={`fixed inset-0 z-50 flex justify-center sm:p-6 ${enHaut ? "items-start" : "items-end sm:items-center"}`}
    >
      <button
        type="button"
        aria-label={libelleFermer}
        onClick={onFermer}
        className="absolute inset-0 animate-voile cursor-default bg-encre/35 backdrop-blur-[2px]"
      />
      <div
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface shadow-flottante sm:max-w-lg sm:rounded-[28px] ${
          enHaut
            ? "animate-descente rounded-b-[28px] pt-[env(safe-area-inset-top)]"
            : "animate-montee rounded-t-[28px]"
        } ${grande ? "h-[92dvh] sm:h-[85dvh] sm:max-w-2xl" : ""}`}
      >
        <button
          type="button"
          onClick={onFermer}
          aria-label={libelleFermer}
          className="absolute end-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-creux text-encre-douce transition hover:text-encre active:scale-90"
        >
          <X className="size-5" />
        </button>
        <div className="marge-securite-bas overflow-y-auto overscroll-contain px-6 pt-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>,
    // Dans l'espace (couleurs de l'établissement, sens d'écriture), à défaut dans la page
    document.querySelector("[data-espace]") ?? document.body,
  );
}
