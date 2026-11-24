"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Proprietes = {
  ouverte: boolean;
  titre: string;
  sousTitre?: string;
  libelleFermer: string;
  onFermer: () => void;
  hauteur?: "contenu" | "haute";
  // Ouverte depuis un bouton du haut de l'écran (☰, notifications) : elle descend sous le doigt,
  // au plus près du geste qui l'a ouverte, plutôt que de monter du bas
  depuisLeHaut?: boolean;
  pied?: React.ReactNode; // barre d'action fixée en bas de la feuille (ex. panier)
  actions?: React.ReactNode; // boutons d'en-tête, à côté de la croix (ex. recherche)
  // Sans titre ni croix : le contenu occupe tout le haut et porte sa propre croix (fiche d'un plat)
  sansEnTete?: boolean;
  children: React.ReactNode;
};

// Doit couvrir l'animation de sortie (globals.css)
const DUREE_SORTIE_MS = 240;
// Distance de glissement (vers le bord d'où vient la feuille) au-delà de laquelle elle se ferme
const SEUIL_FERMETURE_PX = 90;

// Feuille modale : monte du bas de l'écran (geste naturel sur mobile), ou descend du haut.
// Se ferme par la croix, le voile, Échap, ou en la faisant glisser vers son bord.
export function FeuilleBas({
  ouverte,
  titre,
  sousTitre,
  libelleFermer,
  onFermer,
  hauteur = "contenu",
  depuisLeHaut = false,
  pied,
  actions,
  sansEnTete = false,
  children,
}: Proprietes) {
  const [montee, setMontee] = useState(ouverte); // présente à l'écran, y compris pendant la sortie
  const [entree, setEntree] = useState(true); // animation d'entrée en cours
  const [decalage, setDecalage] = useState(0);
  const [glisse, setGlisse] = useState(false);
  const origineGlissement = useRef<number | null>(null);
  const sortie = montee && !ouverte;
  // Sens de fermeture : vers le bas pour une feuille du bas, vers le haut pour une feuille du haut
  const sens = depuisLeHaut ? -1 : 1;

  useEffect(() => {
    if (ouverte) {
      setMontee(true);
      setEntree(true);
      setDecalage(0);
      return;
    }
    const minuteur = setTimeout(() => setMontee(false), DUREE_SORTIE_MS);
    return () => clearTimeout(minuteur);
  }, [ouverte]);

  // Échap pour fermer, défilement de la page bloqué pendant l'ouverture
  useEffect(() => {
    if (!ouverte) return;
    const surTouche = (evenement: KeyboardEvent) =>
      evenement.key === "Escape" && onFermer();
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [ouverte, onFermer]);

  if (!montee) return null;

  const commencerGlissement = (evenement: React.PointerEvent) => {
    if (sortie || (evenement.target as HTMLElement).closest("button")) return;
    origineGlissement.current = evenement.clientY;
    setGlisse(true);
    (evenement.currentTarget as HTMLElement).setPointerCapture(
      evenement.pointerId,
    );
  };
  const suivreGlissement = (evenement: React.PointerEvent) => {
    if (origineGlissement.current === null) return;
    setDecalage(
      Math.max(0, sens * (evenement.clientY - origineGlissement.current)),
    );
  };
  const terminerGlissement = () => {
    if (origineGlissement.current === null) return;
    origineGlissement.current = null;
    setGlisse(false);
    if (decalage > SEUIL_FERMETURE_PX) onFermer();
    else setDecalage(0);
  };
  const glissement = {
    onPointerDown: commencerGlissement,
    onPointerMove: suivreGlissement,
    onPointerUp: terminerGlissement,
    onPointerCancel: terminerGlissement,
  };
  const poignee = (
    <div
      className={`flex justify-center ${depuisLeHaut ? "pt-1 pb-3" : "pt-2.5"}`}
      aria-hidden
    >
      <span className="h-1.5 w-10 rounded-full bg-ligne" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-label={titre}
    >
      <button
        type="button"
        aria-label={libelleFermer}
        onClick={onFermer}
        tabIndex={-1}
        className={`absolute inset-0 bg-encre/35 backdrop-blur-[2px] ${sortie ? "animate-voile-sortie" : "animate-voile"}`}
      />
      <div
        onAnimationEnd={(evenement) =>
          evenement.target === evenement.currentTarget && setEntree(false)
        }
        className={`absolute inset-x-0 mx-auto flex max-w-xl flex-col bg-fond shadow-flottante ${
          depuisLeHaut
            ? "top-0 rounded-b-[30px] pt-[env(safe-area-inset-top)]"
            : "bottom-0 rounded-t-[30px]"
        } ${hauteur === "haute" ? "h-[90dvh]" : "max-h-[85dvh]"} ${
          sortie
            ? depuisLeHaut
              ? "animate-feuille-haut-sortie"
              : "animate-feuille-sortie"
            : entree
              ? depuisLeHaut
                ? "animate-feuille-haut"
                : "animate-feuille"
              : ""
        }`}
        style={
          {
            "--decalage": `${sens * decalage}px`,
            transform:
              sortie || entree ? undefined : `translateY(${sens * decalage}px)`,
            transition: glisse ? "none" : "transform 260ms var(--ease-douce)",
          } as React.CSSProperties
        }
      >
        {/* Poignée et titre : zone de glissement */}
        <div
          {...glissement}
          className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
        >
          {!depuisLeHaut && poignee}
          {!sansEnTete && (
            <header
              className={`flex items-start justify-between gap-4 px-5 pb-4 ${depuisLeHaut ? "pt-5" : "pt-3"}`}
            >
              <div className="min-w-0">
                <h2 className="font-serif text-[28px] leading-[1.1] text-encre">
                  {titre}
                </h2>
                {sousTitre && (
                  <p className="mt-1 text-[13.5px] text-encre-pale">
                    {sousTitre}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {actions}
                <button
                  type="button"
                  onClick={onFermer}
                  aria-label={libelleFermer}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-creux text-encre-douce transition active:scale-90"
                >
                  <X className="size-5" />
                </button>
              </div>
            </header>
          )}
        </div>
        {children}
        {pied}
        {/* Feuille du haut : la poignée en bas, on la remonte pour fermer */}
        {depuisLeHaut && (
          <div
            {...glissement}
            className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
          >
            {poignee}
          </div>
        )}
      </div>
    </div>
  );
}
