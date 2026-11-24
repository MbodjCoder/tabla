"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { seConnecter, type EtatConnexion } from "@/app/espace/actions";

const CHAMP =
  "h-13 w-full rounded-2xl border border-ligne bg-surface px-4 text-[16px] text-encre outline-none transition placeholder:text-encre-pale focus:border-encre";

type Libelles = { email: string; motDePasse: string; seConnecter: string };

export function FormulaireConnexion({ libelles }: { libelles: Libelles }) {
  const [etat, action, enCours] = useActionState<EtatConnexion, FormData>(
    seConnecter,
    { erreur: null },
  );

  return (
    <form action={action} className="mt-10 space-y-3">
      <input
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder={libelles.email}
        className={CHAMP}
      />
      <input
        name="motDePasse"
        type="password"
        autoComplete="current-password"
        required
        placeholder={libelles.motDePasse}
        className={CHAMP}
      />
      {etat.erreur && (
        <p className="px-1 text-[14px] text-alerte">{etat.erreur}</p>
      )}
      <button
        disabled={enCours}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-encre text-[16px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-70"
      >
        {enCours && <Loader2 className="size-5 animate-spin" />}
        {libelles.seConnecter}
      </button>
    </form>
  );
}
