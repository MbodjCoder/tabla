"use client";

// Décisions de l'équipe sur une commande, réduites à l'essentiel :
//
//   Envoyée        : ✕ · Accepter
//   En préparation : ✕ · Servie
//
// Le refus se confirme d'un second geste, le temps d'un compte à rebours : sans
// confirmation, il se referme de lui-même. Chaque bouton se verrouille pendant l'envoi.
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { StatutCommandeVue } from "@/lib/types";

export type LibellesActionsCommande = {
  accepter: string;
  servie: string;
  refuser: string;
  retour: string;
  confirmerRefus: string; // « Refuser »
  questionRefus: string; // « Refuser cette commande ? Le client en sera informé. »
};

// Durée de la confirmation (même valeur que l'animation « decompte » de globals.css)
const DUREE_CONFIRMATION_MS = 6000;

/** Bouton d'envoi d'un formulaire : indicateur de chargement, aucun double envoi. */
export function BoutonEnvoi({
  className,
  name,
  value,
  title,
  children,
}: {
  className: string;
  name?: string;
  value?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      title={title}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ActionsCommande({
  commandeId,
  statut,
  libelles,
  action,
}: {
  commandeId: string;
  statut: StatutCommandeVue;
  libelles: LibellesActionsCommande;
  action: (formulaire: FormData) => Promise<void>;
}) {
  const [refus, setRefus] = useState(false);

  // Confirmation temporaire : sans réponse, retour à l'état de repos
  useEffect(() => {
    if (!refus) return;
    const minuterie = setTimeout(() => setRefus(false), DUREE_CONFIRMATION_MS);
    return () => clearTimeout(minuterie);
  }, [refus]);

  const base =
    "texte-boutons-equipe flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";
  const decision = statut === "ENVOYEE" ? "accepter" : "servir";

  return (
    <form action={action} className="relative">
      <input type="hidden" name="commandeId" value={commandeId} />
      {refus && (
        <p className="texte-courant-equipe mb-2 text-end text-alerte">
          {libelles.questionRefus}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        {refus ? (
          // « Retour » prend la place de la croix : un double appui ne confirme jamais par erreur
          <>
            <button
              type="button"
              onClick={() => setRefus(false)}
              className={`${base} text-encre-douce hover:bg-creux hover:text-encre`}
            >
              {libelles.retour}
            </button>
            <BoutonEnvoi
              name="decision"
              value="refuser"
              className={`${base} bg-alerte text-white hover:bg-alerte/90`}
            >
              {libelles.confirmerRefus}
            </BoutonEnvoi>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRefus(true)}
              aria-label={libelles.refuser}
              title={libelles.refuser}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-ligne bg-surface text-encre-douce transition hover:border-alerte/40 hover:bg-alerte/[0.06] hover:text-alerte active:scale-95"
            >
              <X className="size-[17px]" strokeWidth={2.2} />
            </button>
            <BoutonEnvoi
              name="decision"
              value={decision}
              className={`${base} min-w-28 bg-bouton text-texte-bouton hover:bg-bouton/90`}
            >
              {statut === "ENVOYEE" ? libelles.accepter : libelles.servie}
            </BoutonEnvoi>
          </>
        )}
      </div>
      {refus && (
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-2 block h-0.5 origin-left animate-decompte rounded-full bg-alerte/45 rtl:origin-right"
        />
      )}
    </form>
  );
}
