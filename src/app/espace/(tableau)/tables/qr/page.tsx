// Chevalets de l'établissement à imprimer : le gérant choisit les tables, une page A6 par table.
import {
  ChevaletQr,
  StylesImpressionChevalets,
} from "@/composants/espace/ChevaletQr";
import { SelectionImpression } from "@/composants/espace/SelectionImpression";
import { bdd } from "@/lib/bdd";
import { env } from "@/lib/env";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { exigerPersonnel } from "@/lib/session-personnel";

export const metadata = { title: "QR codes · Tabla" };

export default async function PageTousQr() {
  const { etablissementId } = await exigerPersonnel();
  const etablissement = await bdd.etablissement.findUniqueOrThrow({
    where: { id: etablissementId },
    include: {
      tables: {
        where: { actif: true },
        orderBy: [{ ordre: "asc" }, { numero: "asc" }],
      },
    },
  });
  const { t } = await traducteurEquipeCourant(etablissement.langueEquipe);

  return (
    <div className="flex flex-col items-center gap-6 print:block">
      <StylesImpressionChevalets />
      <SelectionImpression
        libelles={{
          titre: t("choisirTables"),
          toutes: t("toutes"),
          aucune: t("aucune"),
          imprimer: t("imprimer"),
        }}
        chevalets={etablissement.tables.map((table) => ({
          id: table.id,
          numero: table.numero,
          contenu: (
            <ChevaletQr
              url={`${env.URL_PUBLIQUE}/t/${table.jetonQr}`}
              numeroTable={table.numero}
              libelleTable={t("table")}
              sautDePage
            />
          ),
        }))}
      />
    </div>
  );
}
