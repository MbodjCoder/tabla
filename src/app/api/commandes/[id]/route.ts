// Le client annule sa commande, tant que l'équipe ne l'a pas acceptée.
import { z } from "zod";
import { annulerParClient } from "@/lib/commandes";
import { resoudreTable } from "@/lib/contexte-table";

const schemaAnnulation = z.object({ jeton: z.string().min(8).max(32) });

export async function POST(
  requete: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const corps = schemaAnnulation.safeParse(
    await requete.json().catch(() => null),
  );
  if (!corps.success)
    return Response.json({ erreur: "requeteInvalide" }, { status: 400 });

  const contexte = await resoudreTable(corps.data.jeton);
  if (!contexte)
    return Response.json({ erreur: "tableIntrouvable" }, { status: 404 });

  // Refus si l'équipe l'a déjà acceptée entre-temps
  const commande = await annulerParClient(contexte.table.id, id);
  if (!commande)
    return Response.json({ erreur: "dejaAcceptee" }, { status: 409 });
  return Response.json({ commande });
}
