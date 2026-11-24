// POST : le client envoie son panier depuis sa table.
// GET  : suivi en direct de ses commandes (et des appels en attente de la table).
import { z } from "zod";
import { appelsEnAttente } from "@/lib/appels";
import {
  LIGNES_MAX,
  LONGUEUR_MAX_NOTE,
  QUANTITE_MAX,
  creerCommande,
  statutsCommandes,
} from "@/lib/commandes";
import { resoudreTable } from "@/lib/contexte-table";
import { LANGUES_CLIENT } from "@/lib/langues";
import { adresseClient, autoriser } from "@/lib/limiteur";

const schemaCommande = z.object({
  jeton: z.string().min(8).max(32),
  lignes: z
    .array(
      z.object({
        articleId: z.string().min(1).max(40),
        quantite: z.number().int().min(1).max(QUANTITE_MAX),
      }),
    )
    .min(1)
    .max(LIGNES_MAX),
  note: z.string().max(LONGUEUR_MAX_NOTE).nullable().default(null),
  langue: z.enum(LANGUES_CLIENT).default("fr"),
  // Clé d'envoi tirée au hasard par le téléphone (renvoyée telle quelle en cas de nouvel essai)
  cle: z
    .string()
    .regex(/^[A-Za-z0-9_-]{16,64}$/)
    .nullable()
    .default(null),
});

// Identifiants attendus : cuid (lettres minuscules et chiffres)
const IDENTIFIANT = /^[a-z0-9]{10,40}$/;
const SUIVIES_MAX = 20;

export async function POST(requete: Request) {
  const corps = schemaCommande.safeParse(
    await requete.json().catch(() => null),
  );
  if (!corps.success)
    return Response.json({ erreur: "requeteInvalide" }, { status: 400 });
  const { jeton, lignes, note, langue, cle } = corps.data;

  // Large pour une vraie table, bloquant pour un QR photographié qui servirait à des farces
  const autorise =
    autoriser(`commande:${jeton}`, 8, 10 * 60 * 1000) &&
    autoriser(`commande-ip:${await adresseClient()}`, 20, 10 * 60 * 1000);
  if (!autorise)
    return Response.json({ erreur: "tropDeCommandes" }, { status: 429 });

  const contexte = await resoudreTable(jeton);
  if (!contexte)
    return Response.json({ erreur: "tableIntrouvable" }, { status: 404 });

  const resultat = await creerCommande(contexte, lignes, note, langue, cle);
  if (!resultat.ok) return Response.json(resultat, { status: 409 });
  return Response.json(resultat);
}

export async function GET(requete: Request) {
  const parametres = new URL(requete.url).searchParams;
  const contexte = await resoudreTable(parametres.get("jeton") ?? "");
  if (!contexte)
    return Response.json({ commandes: [], appels: [] }, { status: 404 });

  const ids = (parametres.get("ids") ?? "")
    .split(",")
    .filter((id) => IDENTIFIANT.test(id))
    .slice(0, SUIVIES_MAX);
  const [commandes, appels] = await Promise.all([
    ids.length ? statutsCommandes(contexte.table.id, ids) : [],
    appelsEnAttente(contexte.table.id),
  ]);
  return Response.json(
    { commandes, appels },
    { headers: { "Cache-Control": "no-store" } },
  );
}
