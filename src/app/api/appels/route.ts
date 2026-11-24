// « Appeler un serveur » / « Demander l'addition » depuis la table.
import { z } from "zod";
import { appeler } from "@/lib/appels";
import { resoudreTable } from "@/lib/contexte-table";
import { autoriser } from "@/lib/limiteur";

const schemaAppel = z.object({
  jeton: z.string().min(8).max(32),
  type: z.enum(["SERVEUR", "ADDITION"]),
});

export async function POST(requete: Request) {
  const corps = schemaAppel.safeParse(await requete.json().catch(() => null));
  if (!corps.success)
    return Response.json({ erreur: "requeteInvalide" }, { status: 400 });

  if (!autoriser(`appel:${corps.data.jeton}`, 10, 10 * 60 * 1000)) {
    return Response.json({ erreur: "tropDAppels" }, { status: 429 });
  }
  const contexte = await resoudreTable(corps.data.jeton);
  if (!contexte)
    return Response.json({ erreur: "tableIntrouvable" }, { status: 404 });

  const appel = await appeler(
    contexte.etablissement.id,
    contexte.table.id,
    corps.data.type,
  );
  return Response.json({ appel });
}
