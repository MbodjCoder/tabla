"use client";

import { Printer } from "lucide-react";

export function BoutonImprimer({ libelle }: { libelle: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="texte-boutons-equipe flex h-11 items-center gap-2 rounded-full bg-bouton px-5 text-texte-bouton transition active:scale-[0.98] print:hidden"
    >
      <Printer className="size-4" />
      {libelle}
    </button>
  );
}
