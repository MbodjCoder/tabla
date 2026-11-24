// Accueil de l'équipe : le tableau de bord du service (nouvelles commandes, en cours, appels), chacun
// avec le nombre de choses qui l'attendent. Toutes les pages de travail s'ouvrent ici en page
// temporaire (?page=…) : nouvelles, en cours, appels, et, depuis ☰ (barre du haut), tables, carte
// et paramètres.
import { ContenuCarte } from "@/composants/espace/ContenuCarte";
import {
  ContenuCommandes,
  VUES_SERVICE,
} from "@/composants/espace/ContenuCommandes";
import { ContenuParametres } from "@/composants/espace/ContenuParametres";
import { ContenuTables } from "@/composants/espace/ContenuTables";
import { Rafraichisseur } from "@/composants/espace/Rafraichisseur";
import {
  TableauService,
  type PageTemporaire,
} from "@/composants/espace/TableauService";
import { compteursService, lireEtablissement } from "@/lib/compteurs-service";
import type { TraduireEquipe } from "@/lib/i18n/equipe";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { exigerPersonnel } from "@/lib/session-personnel";

export const dynamic = "force-dynamic";

const PAGES: readonly PageTemporaire[] = [
  ...VUES_SERVICE,
  "tables",
  "carte",
  "parametres",
];

// Le titre de chaque page temporaire
const titres = (t: TraduireEquipe): Record<PageTemporaire, string> => ({
  nouvelles: t("ongletNouvelles"),
  preparation: t("ongletPreparation"),
  appels: t("ongletAppels"),
  tables: t("navTables"),
  carte: t("navCarte"),
  parametres: t("parametres"),
});

export default async function PageAccueil({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    vue?: string;
    h?: string;
    categorie?: string;
    q?: string;
  }>;
}) {
  const parametres = await searchParams;
  const pageOuverte = PAGES.find((cle) => cle === parametres.page) ?? null;
  const session = await exigerPersonnel();
  const [etablissement, compte] = await Promise.all([
    lireEtablissement(session.etablissementId),
    compteursService(session),
  ]);
  const { t } = await traducteurEquipeCourant(etablissement.langueEquipe);

  return (
    <>
      {/* Compteurs et durées à jour sans recharger ; les nouvelles commandes arrivent par les alertes */}
      <Rafraichisseur intervalleMs={30000} />
      <h1 className="sr-only">{t("navAccueil")}</h1>

      <div className="mx-auto max-w-3xl pt-2">
        <TableauService
          titres={titres(t)}
          pageOuverte={pageOuverte}
          libelleFermer={t("fermer")}
          details={[
            {
              cle: "nouvelles",
              libelle: t("ongletNouvelles"),
              nombre: compte.nouvelles,
            },
            {
              cle: "preparation",
              libelle: t("ongletPreparation"),
              nombre: compte.preparation,
            },
            {
              cle: "appels",
              libelle: t("ongletAppels"),
              nombre: compte.appels,
            },
          ]}
        >
          {pageOuverte === "tables" ? (
            <ContenuTables parametres={parametres} />
          ) : pageOuverte === "carte" ? (
            <ContenuCarte parametres={parametres} />
          ) : pageOuverte === "parametres" ? (
            <ContenuParametres />
          ) : pageOuverte ? (
            <ContenuCommandes vue={pageOuverte} h={parametres.h} />
          ) : null}
        </TableauService>
      </div>
    </>
  );
}
