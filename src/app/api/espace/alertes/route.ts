// Alertes de l'équipe, interrogées toutes les quelques secondes par l'espace.
import { alertesEquipe } from "@/lib/alertes-equipe";
import { bdd } from "@/lib/bdd";
import { lireLangueEquipe } from "@/lib/langue-equipe";
import { lireSession } from "@/lib/session-personnel";

export async function GET() {
  const session = await lireSession();
  if (!session) return Response.json({ alertes: [] }, { status: 401 });

  const etablissement = await bdd.etablissement.findUnique({
    where: { id: session.etablissementId },
    select: { langueEquipe: true },
  });
  const langue = await lireLangueEquipe(etablissement?.langueEquipe);
  const alertes = await alertesEquipe(session.etablissementId, langue);
  return Response.json(
    { alertes },
    { headers: { "Cache-Control": "no-store" } },
  );
}
