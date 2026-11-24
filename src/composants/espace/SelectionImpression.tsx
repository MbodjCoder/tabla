"use client";

import { Printer } from "lucide-react";
import { useState } from "react";

type Chevalet = { id: string; numero: string; contenu: React.ReactNode };

type Proprietes = {
  chevalets: Chevalet[];
  libelles: { titre: string; toutes: string; aucune: string; imprimer: string };
};

// Le gérant choisit les tables d'un geste (puces ou chevalets) ; seules
// celles-ci partent à l'impression, une page A6 par table.
export function SelectionImpression({ chevalets, libelles }: Proprietes) {
  const [choisies, setChoisies] = useState(
    () => new Set(chevalets.map((chevalet) => chevalet.id)),
  );

  const basculer = (id: string) =>
    setChoisies((actuelles) => {
      const suivantes = new Set(actuelles);
      if (suivantes.has(id)) suivantes.delete(id);
      else suivantes.add(id);
      return suivantes;
    });

  return (
    <>
      <div className="w-full rounded-[24px] border border-ligne bg-surface p-4 shadow-carte print:hidden sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="texte-textes-equipe">{libelles.titre}</p>
          <div className="texte-libelles-equipe flex gap-2">
            <button
              type="button"
              onClick={() =>
                setChoisies(new Set(chevalets.map((chevalet) => chevalet.id)))
              }
              className="h-9 rounded-full border border-ligne px-3.5 transition hover:bg-creux"
            >
              {libelles.toutes}
            </button>
            <button
              type="button"
              onClick={() => setChoisies(new Set())}
              className="h-9 rounded-full border border-ligne px-3.5 transition hover:bg-creux"
            >
              {libelles.aucune}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {chevalets.map(({ id, numero }) => (
            <button
              key={id}
              type="button"
              onClick={() => basculer(id)}
              aria-pressed={choisies.has(id)}
              className={`texte-boutons-equipe h-10 min-w-14 rounded-xl px-3 tabular-nums transition active:scale-95 ${
                choisies.has(id)
                  ? "bg-selection text-texte-selection"
                  : "border border-ligne bg-fond text-encre-pale"
              }`}
            >
              {numero}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          disabled={choisies.size === 0}
          className="texte-boutons-equipe mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-bouton text-texte-bouton transition active:scale-[0.98] disabled:opacity-40 sm:w-auto sm:px-6"
        >
          <Printer className="size-[18px]" />
          {libelles.imprimer} · {choisies.size}
        </button>
      </div>

      <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 print:block">
        {chevalets.map(({ id, numero, contenu }) => (
          <button
            key={id}
            type="button"
            onClick={() => basculer(id)}
            aria-pressed={choisies.has(id)}
            aria-label={numero}
            className={`flex w-full justify-center transition print:block ${
              choisies.has(id) ? "" : "opacity-35 grayscale print:hidden"
            }`}
          >
            {contenu}
          </button>
        ))}
      </div>
    </>
  );
}
