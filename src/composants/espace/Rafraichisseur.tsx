"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Rafraîchit les données serveur de la page à intervalle régulier : en pause quand l'onglet
// est masqué ou hors ligne (rien ne s'empile sur un réseau coupé), aussitôt au retour.
export function Rafraichisseur({ intervalleMs }: { intervalleMs: number }) {
  const routeur = useRouter();
  useEffect(() => {
    const disponible = () => !document.hidden && navigator.onLine;
    const minuterie = setInterval(
      () => disponible() && routeur.refresh(),
      intervalleMs,
    );
    const auRetour = () => disponible() && routeur.refresh();
    document.addEventListener("visibilitychange", auRetour);
    window.addEventListener("online", auRetour);
    return () => {
      clearInterval(minuterie);
      document.removeEventListener("visibilitychange", auRetour);
      window.removeEventListener("online", auRetour);
    };
  }, [routeur, intervalleMs]);
  return null;
}
