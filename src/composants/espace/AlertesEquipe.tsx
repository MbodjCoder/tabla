"use client";

import { BellRing, ClipboardList, ReceiptText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AlerteEquipe } from "@/lib/alertes-equipe";
import { useInterrogation } from "@/lib/interrogation";
import { deverrouillerSon, jouerAlerte } from "@/lib/son-notification";

type Libelles = {
  nouvelleCommande: string;
  appelServeur: string;
  appelAddition: string;
  autresAlertes: { une: string; plusieurs: string }; // « +{n} autre » / « +{n} autres »
  table: string;
};

type Proprietes = {
  alertesInitiales: AlerteEquipe[];
  titrePage: string;
  libelles: Libelles;
};

const INTERVALLE_MS = 5000;
const DUREE_BANDEAU_MS = 7000;
/** Événement diffusé à la navigation (pastille du nombre d'alertes). */
export const EVENEMENT_ALERTES = "tabla:alertes";
// Les navigateurs n'autorisent le son qu'après un geste : le premier, quel qu'il soit, le débloque
const GESTES = ["pointerdown", "keydown", "touchstart"] as const;

// Veille de l'espace de l'équipe, présente sur toutes ses pages : chaque nouvelle alerte
// sonne brièvement (son actif par défaut) et s'affiche en bandeau.
export function AlertesEquipe({
  alertesInitiales,
  titrePage,
  libelles,
}: Proprietes) {
  const routeur = useRouter();
  const chemin = usePathname();
  const [alertes, setAlertes] = useState(alertesInitiales);
  // Bandeau : l'alerte la plus importante parmi les nouvelles, et combien d'autres l'accompagnent
  const [bandeau, setBandeau] = useState<{
    alerte: AlerteEquipe;
    autres: number;
  } | null>(null);
  const vues = useRef(new Set(alertesInitiales.map((alerte) => alerte.id)));
  const empreinte = useRef(alertesInitiales.map((alerte) => alerte.id).join());

  useEffect(() => {
    // Déjà autorisé si le navigateur fait confiance au site ; sinon, dès le premier geste
    void deverrouillerSon();
    const surGeste = () => {
      void deverrouillerSon().then((autorise) => {
        if (autorise)
          GESTES.forEach((geste) =>
            window.removeEventListener(geste, surGeste),
          );
      });
    };
    GESTES.forEach((geste) => window.addEventListener(geste, surGeste));
    return () =>
      GESTES.forEach((geste) => window.removeEventListener(geste, surGeste));
  }, []);

  // Interrogation régulière : une requête à la fois, bornée dans le temps, ralentie si le réseau
  // peine, en pause quand l'onglet est masqué et relancée dès qu'il redevient visible
  useInterrogation(
    async (signal) => {
      try {
        const reponse = await fetch("/api/espace/alertes", {
          cache: "no-store",
          signal,
        });
        if (!reponse.ok) return false;
        const { alertes: recues } = (await reponse.json()) as {
          alertes: AlerteEquipe[];
        };
        const nouvelles = recues.filter(
          (alerte) => !vues.current.has(alerte.id),
        );
        nouvelles.forEach((alerte) => vues.current.add(alerte.id));
        if (nouvelles.length > 0) {
          jouerAlerte();
          // La liste arrive déjà triée : appels d'abord, puis la commande la plus ancienne
          setBandeau({ alerte: nouvelles[0], autres: nouvelles.length - 1 });
        }
        setAlertes(recues);
        const nouvelleEmpreinte = recues.map((alerte) => alerte.id).join();
        if (nouvelleEmpreinte !== empreinte.current) {
          empreinte.current = nouvelleEmpreinte;
          routeur.refresh(); // la page affichée reflète aussitôt le changement
        }
        return true;
      } catch {
        return false;
      }
    },
    { intervalleMs: INTERVALLE_MS },
  );

  useEffect(() => {
    document.title =
      alertes.length > 0 ? `(${alertes.length}) ${titrePage}` : titrePage;
    window.dispatchEvent(
      new CustomEvent(EVENEMENT_ALERTES, { detail: alertes.length }),
    );
  }, [alertes, titrePage, chemin]);

  useEffect(() => {
    if (!bandeau) return;
    const minuteur = setTimeout(() => setBandeau(null), DUREE_BANDEAU_MS);
    return () => clearTimeout(minuteur);
  }, [bandeau]);

  return (
    <>
      {bandeau && (
        <button
          type="button"
          onClick={() => {
            setBandeau(null);
            routeur.push(
              bandeau.alerte.genre === "commande"
                ? "/espace/accueil?page=nouvelles"
                : "/espace/accueil?page=appels",
            );
          }}
          className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-sm animate-apparition items-center gap-2.5 rounded-2xl bg-encre py-2 ps-2 pe-3.5 text-start text-white shadow-flottante"
        >
          <span
            className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/12"
            aria-hidden
          >
            <IconeAlerte genre={bandeau.alerte.genre} />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13.5px] font-semibold">
              {libelles.table} {bandeau.alerte.table} ·{" "}
              {titreAlerte(bandeau.alerte, libelles)}
            </span>
            {bandeau.alerte.resume && (
              <span className="mt-0.5 block truncate text-[12.5px] text-white/70">
                {bandeau.alerte.resume}
              </span>
            )}
          </span>
          {bandeau.autres > 0 && (
            <span className="shrink-0 rounded-full bg-white/12 px-2 py-0.5 text-[11.5px] font-semibold tabular-nums">
              {(bandeau.autres === 1
                ? libelles.autresAlertes.une
                : libelles.autresAlertes.plusieurs
              ).replace("{n}", String(bandeau.autres))}
            </span>
          )}
        </button>
      )}
    </>
  );
}

function titreAlerte(alerte: AlerteEquipe, libelles: Libelles): string {
  if (alerte.genre === "serveur") return libelles.appelServeur;
  if (alerte.genre === "addition") return libelles.appelAddition;
  return libelles.nouvelleCommande;
}

function IconeAlerte({ genre }: { genre: AlerteEquipe["genre"] }) {
  if (genre === "serveur") return <BellRing className="size-4" />;
  if (genre === "addition") return <ReceiptText className="size-4" />;
  return <ClipboardList className="size-4" />;
}
