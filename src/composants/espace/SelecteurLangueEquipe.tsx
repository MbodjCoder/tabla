"use client";

// Langue de l'interface de l'équipe : même bouton que côté client (globe · code · chevron),
// et les mêmes huit langues. Le choix est mémorisé sur l'appareil (action serveur, cookie).
import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { changerLangueEquipe } from "@/app/espace/actions";
import {
  FICHES_LANGUES,
  LANGUES_EQUIPE,
  type LangueEquipe,
} from "@/lib/langues";

export function SelecteurLangueEquipe({
  langue,
  libelle,
}: {
  langue: LangueEquipe;
  libelle: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const zone = useRef<HTMLDivElement>(null);

  // Fermeture au clic en dehors ou à la touche Échap
  useEffect(() => {
    if (!ouvert) return;
    const auClic = (evenement: PointerEvent) => {
      if (!zone.current?.contains(evenement.target as Node)) setOuvert(false);
    };
    const aLaTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setOuvert(false);
    };
    document.addEventListener("pointerdown", auClic);
    document.addEventListener("keydown", aLaTouche);
    return () => {
      document.removeEventListener("pointerdown", auClic);
      document.removeEventListener("keydown", aLaTouche);
    };
  }, [ouvert]);

  return (
    <div ref={zone} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((valeur) => !valeur)}
        aria-label={libelle}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        className="texte-boutons-equipe flex h-9 items-center gap-1 rounded-full border border-ligne bg-surface px-3 uppercase tracking-wide text-encre transition hover:bg-creux active:scale-95"
      >
        <Globe className="size-3.5 text-encre-douce" strokeWidth={2} />
        {langue}
        <ChevronDown
          className={`size-3 text-encre-pale transition-transform ${ouvert ? "rotate-180" : ""}`}
          strokeWidth={2.4}
        />
      </button>

      {ouvert && (
        <form
          action={changerLangueEquipe}
          onSubmit={() => setOuvert(false)}
          className="absolute end-0 top-11 z-40 w-52 animate-apparition rounded-2xl border border-ligne bg-surface p-1.5 shadow-flottante"
        >
          <ul role="listbox" aria-label={libelle}>
            {LANGUES_EQUIPE.map((code) => {
              const active = code === langue;
              const fiche = FICHES_LANGUES[code];
              return (
                <li key={code}>
                  <button
                    name="langue"
                    value={code}
                    role="option"
                    aria-selected={active}
                    lang={code}
                    dir={fiche.sens}
                    className={`texte-libelles-equipe flex h-10 w-full items-center justify-between gap-3 rounded-xl px-3 text-start transition ${
                      active
                        ? "bg-accent-pale text-accent-profond"
                        : "text-encre hover:bg-creux"
                    }`}
                  >
                    {fiche.nomNatif}
                    {active ? (
                      <span className="grid size-5 place-items-center rounded-full bg-accent text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="texte-sections-equipe uppercase text-sections-equipe">
                        {code}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </form>
      )}
    </div>
  );
}
