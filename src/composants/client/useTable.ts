"use client";

// État de la table côté client : panier, commandes envoyées et leur suivi en direct, appels.
// Panier et commandes sont gardés sur l'appareil : un rechargement ne perd rien.
// Pensé pour un réseau lent ou saturé : chaque requête est bornée dans le temps, et un envoi
// répété (réponse perdue, nouvel essai, page rechargée) ne crée jamais de seconde commande.
import { useCallback, useEffect, useRef, useState } from "react";
import { signalDelai, useInterrogation } from "@/lib/interrogation";
import { deverrouillerSon, jouerNotification } from "@/lib/son-notification";
import type { CommandeVue, LignePanier, TypeAppelVue } from "@/lib/types";

const INTERVALLE_SUIVI_MS = 5000;
// Au-delà, une commande appartient à un repas précédent : elle n'est plus suivie
const DUREE_SUIVI_MS = 12 * 60 * 60 * 1000;
// L'envoi d'une commande peut prendre du temps sur un réseau saturé, sans jamais rester suspendu
const DELAI_ENVOI_MS = 25 * 1000;
const DELAI_GESTE_MS = 15 * 1000;
const QUANTITE_MAX = 20;
// Panier initial, avant la relecture de l'appareil : jamais écrit (il effacerait le panier gardé)
const PANIER_NON_RELU: Record<string, number> = {};

export type ErreurEnvoi =
  "erreurReseau" | "erreurIndisponible" | "tropDeCommandes";

function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}

function ecrire(cle: string, valeur: unknown) {
  try {
    if (valeur === null) localStorage.removeItem(cle);
    else localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    // Navigation privée : l'état ne survivra simplement pas au rechargement
  }
}

/** Clé d'envoi aléatoire (crypto.getRandomValues : disponible même hors HTTPS). */
function nouvelleCleEnvoi(): string {
  const octets = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...octets))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

type CommandeSuivie = { id: string; le: number };
// Envoi en attente de confirmation : même panier et même note = même clé
type EnvoiEnAttente = { cle: string; empreinte: string };

export function useTable({ jeton, langue }: { jeton: string; langue: string }) {
  const clePanier = `tabla:panier:${jeton}`;
  const cleCommandes = `tabla:commandes:${jeton}`;
  const cleEnvoi = `tabla:envoi:${jeton}`;
  const [panier, setPanier] = useState(PANIER_NON_RELU);
  const [note, setNote] = useState("");
  const [commandes, setCommandes] = useState<CommandeVue[]>([]);
  const [appels, setAppels] = useState<TypeAppelVue[]>([]);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const verrouEnvoi = useRef(false); // deux appuis rapides partent avant le rendu de « envoiEnCours »
  const suivies = useRef<CommandeSuivie[]>([]);
  const statuts = useRef(new Map<string, string>());

  // Reprise après rechargement
  useEffect(() => {
    setPanier(lire(clePanier, {}));
    suivies.current = lire<CommandeSuivie[]>(cleCommandes, []).filter(
      (c) => Date.now() - c.le < DUREE_SUIVI_MS,
    );
  }, [clePanier, cleCommandes]);

  useEffect(() => {
    if (panier !== PANIER_NON_RELU) ecrire(clePanier, panier);
  }, [clePanier, panier]);

  const changerQuantite = useCallback((articleId: string, ecart: number) => {
    void deverrouillerSon(); // premier geste : le son du suivi sera permis
    setPanier((actuel) => {
      const quantite = Math.max(
        0,
        Math.min(QUANTITE_MAX, (actuel[articleId] ?? 0) + ecart),
      );
      const { [articleId]: _retire, ...reste } = actuel;
      return quantite > 0 ? { ...reste, [articleId]: quantite } : reste;
    });
  }, []);

  const retirerDuPanier = useCallback((ids: Iterable<string>) => {
    const retires = new Set(ids);
    setPanier((actuel) =>
      Object.fromEntries(
        Object.entries(actuel).filter(([id]) => !retires.has(id)),
      ),
    );
  }, []);

  const vider = useCallback(() => {
    setPanier({});
    setNote("");
  }, []);

  // Suivi : statut des commandes de l'appareil et appels en attente de la table
  const actualiser = useCallback(
    async (signal: AbortSignal = signalDelai()): Promise<boolean> => {
      const ids = suivies.current.map((commande) => commande.id);
      try {
        const reponse = await fetch(
          `/api/commandes?jeton=${encodeURIComponent(jeton)}&ids=${ids.join(",")}`,
          {
            cache: "no-store",
            signal,
          },
        );
        if (!reponse.ok) return false;
        const donnees = (await reponse.json()) as {
          commandes: CommandeVue[];
          appels: TypeAppelVue[];
        };
        // Un changement d'état (acceptée, servie…) sonne discrètement
        const change = donnees.commandes.some((commande) => {
          const avant = statuts.current.get(commande.id);
          return avant !== undefined && avant !== commande.statut;
        });
        donnees.commandes.forEach((commande) =>
          statuts.current.set(commande.id, commande.statut),
        );
        if (change) jouerNotification();
        setCommandes(donnees.commandes.toSorted((a, b) => b.numero - a.numero));
        setAppels(donnees.appels);
        return true;
      } catch {
        return false; // réseau instable : l'interrogation ralentit puis réessaie
      }
    },
    [jeton],
  );

  const enAttente =
    commandes.some((c) => c.statut === "ENVOYEE" || c.statut === "ACCEPTEE") ||
    appels.length > 0;
  useEffect(() => {
    void actualiser();
  }, [actualiser]);
  useInterrogation(actualiser, {
    intervalleMs: INTERVALLE_SUIVI_MS,
    actif: enAttente,
  });

  /** Envoie les lignes du panier ; renvoie l'erreur à afficher, ou null si la commande est partie. */
  const envoyer = useCallback(
    async (lignes: LignePanier[]): Promise<ErreurEnvoi | null> => {
      if (verrouEnvoi.current || lignes.length === 0) return null;
      verrouEnvoi.current = true;
      setEnvoiEnCours(true);
      const noteEnvoyee = note.trim() || null;
      // Même panier, même note : même clé, et le serveur renvoie la commande déjà créée
      const empreinte = JSON.stringify([
        lignes.toSorted((a, b) => a.articleId.localeCompare(b.articleId)),
        noteEnvoyee,
      ]);
      const precedent = lire<EnvoiEnAttente | null>(cleEnvoi, null);
      const envoi =
        precedent?.empreinte === empreinte
          ? precedent
          : { cle: nouvelleCleEnvoi(), empreinte };
      ecrire(cleEnvoi, envoi);
      try {
        const reponse = await fetch("/api/commandes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jeton,
            lignes,
            note: noteEnvoyee,
            langue,
            cle: envoi.cle,
          }),
          signal: signalDelai(DELAI_ENVOI_MS),
        });
        const donnees = await reponse.json().catch(() => null);
        if (reponse.status === 429) return "tropDeCommandes";
        if (
          donnees?.erreur === "indisponible" ||
          donnees?.erreur === "articleInconnu"
        ) {
          // Épuisés ou retirés de la carte : ils sortent du panier, le reste attend une nouvelle confirmation
          retirerDuPanier(donnees.articles ?? []);
          return "erreurIndisponible";
        }
        if (!reponse.ok || !donnees?.commande) return "erreurReseau";
        const commande = donnees.commande as CommandeVue;
        ecrire(cleEnvoi, null);
        if (!suivies.current.some((suivie) => suivie.id === commande.id)) {
          suivies.current = [
            { id: commande.id, le: Date.now() },
            ...suivies.current,
          ];
          ecrire(cleCommandes, suivies.current);
        }
        statuts.current.set(commande.id, commande.statut);
        setCommandes((actuelles) => [
          commande,
          ...actuelles.filter((c) => c.id !== commande.id),
        ]);
        vider();
        return null;
      } catch {
        return "erreurReseau"; // réponse perdue : un nouvel essai réutilise la même clé, sans doublon
      } finally {
        verrouEnvoi.current = false;
        setEnvoiEnCours(false);
      }
    },
    [note, jeton, langue, cleEnvoi, cleCommandes, vider, retirerDuPanier],
  );

  const annuler = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const reponse = await fetch(`/api/commandes/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jeton }),
          signal: signalDelai(DELAI_GESTE_MS),
        });
        if (!reponse.ok) {
          await actualiser(); // déjà acceptée entre-temps : on montre le vrai statut
          return false;
        }
        const { commande } = (await reponse.json()) as {
          commande: CommandeVue;
        };
        statuts.current.set(commande.id, commande.statut);
        setCommandes((actuelles) =>
          actuelles.map((c) => (c.id === commande.id ? commande : c)),
        );
        return true;
      } catch {
        return false;
      }
    },
    [jeton, actualiser],
  );

  const appeler = useCallback(
    async (type: TypeAppelVue): Promise<boolean> => {
      void deverrouillerSon();
      setAppels((actuels) =>
        actuels.includes(type) ? actuels : [...actuels, type],
      ); // retour immédiat
      try {
        const reponse = await fetch("/api/appels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jeton, type }),
          signal: signalDelai(DELAI_GESTE_MS),
        });
        if (!reponse.ok) throw new Error();
        return true;
      } catch {
        setAppels((actuels) => actuels.filter((t) => t !== type));
        return false;
      }
    },
    [jeton],
  );

  return {
    panier,
    note,
    setNote,
    commandes,
    appels,
    envoiEnCours,
    changerQuantite,
    vider,
    envoyer,
    annuler,
    appeler,
  };
}
