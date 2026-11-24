// Types partagés client / serveur (aucune dépendance serveur ici).

/** Carte exposée à l'interface client, avec toutes ses traductions (changement de langue instantané). */
export type ArticleVue = {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  photo: string | null;
  disponible: boolean; // indisponible : affiché, mais ne peut pas être ajouté
  traductions: Partial<Record<string, { nom: string; description?: string }>>;
};

export type CategorieVue = {
  id: string;
  nom: string;
  horaires: string | null;
  traductions: Partial<Record<string, { nom: string }>>;
  articles: ArticleVue[];
};

export type StatutCommandeVue = "ENVOYEE" | "ACCEPTEE" | "SERVIE" | "ANNULEE";

export type LigneCommandeVue = {
  quantite: number;
  prixUnitaire: number;
  libelle: string; // français
  traductions: Partial<Record<string, string>>; // nom dans chaque langue
};

/** Commande telle que la voient le client (suivi) et l'équipe. */
export type CommandeVue = {
  id: string;
  numero: number;
  statut: StatutCommandeVue;
  langueClient: string;
  note: string | null;
  montantTotal: number;
  annuleeParClient: boolean;
  creeLe: string; // instants ISO
  accepteeLe: string | null;
  servieLe: string | null;
  lignes: LigneCommandeVue[];
};

/** Article du panier envoyé par le client : les prix sont toujours relus côté serveur. */
export type LignePanier = { articleId: string; quantite: number };

export type TypeAppelVue = "SERVEUR" | "ADDITION";
