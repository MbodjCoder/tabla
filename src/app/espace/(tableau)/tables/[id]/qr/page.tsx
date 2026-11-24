// Chevalet d'une table, prêt à imprimer.
import { notFound } from "next/navigation";
import { BoutonImprimer } from "@/composants/espace/BoutonImprimer";
import {
  ChevaletQr,
  StylesImpressionChevalets,
} from "@/composants/espace/ChevaletQr";
import { bdd } from "@/lib/bdd";
import { env } from "@/lib/env";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { exigerPersonnel } from "@/lib/session-personnel";

export const metadata = { title: "QR code · Tabla" };

export default async function PageQr({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { etablissementId } = await exigerPersonnel();
  const { id } = await params;
  const table = await bdd.table.findFirst({
    where: { id, etablissementId },
    include: { etablissement: true },
  });
  if (!table) notFound();
  const { t } = await traducteurEquipeCourant(table.etablissement.langueEquipe);
  const url = `${env.URL_PUBLIQUE}/t/${table.jetonQr}`;

  return (
    <div className="flex flex-col items-center gap-6 print:block">
      <StylesImpressionChevalets />
      <BoutonImprimer libelle={t("imprimerChevalet")} />
      <ChevaletQr
        url={url}
        numeroTable={table.numero}
        libelleTable={t("table")}
      />
      <p className="text-[12px] text-encre-pale print:hidden">{url}</p>
    </div>
  );
}
