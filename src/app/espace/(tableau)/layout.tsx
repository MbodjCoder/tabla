import Link from "next/link";
import { AlertesEquipe } from "@/composants/espace/AlertesEquipe";
import { EcranRestaurant } from "@/composants/espace/EcranRestaurant";
import { alertesEquipe } from "@/lib/alertes-equipe";
import { compteursService, lireEtablissement } from "@/lib/compteurs-service";
import { ACCENT_EQUIPE, BOUTONS_EQUIPE, variablesEspace } from "@/lib/couleurs";
import { formesPluriel } from "@/lib/i18n/equipe";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { FICHES_LANGUES } from "@/lib/langues";
import { exigerPersonnel } from "@/lib/session-personnel";

// Une seule interface pour toute l'équipe : l'accueil (tableau de bord du service), chaque page y
// ramène, comme le logo. Le design est celui de Lalla, commun à tous les établissements : en-tête
// blanc, logo « Restaurant · Sénégal » sans nom propre, couleurs de l'équipe fixes (celles de la carte
// client restent propres à chaque établissement). Les trois barres, à droite, ouvrent « Restaurant »
// (tables, carte, paramètres) depuis n'importe quelle page.
export default async function MiseEnPageEspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await exigerPersonnel();
  // L'établissement et les compteurs en parallèle ; la page réutilise les mêmes lectures
  const [etablissement, compte] = await Promise.all([
    lireEtablissement(session.etablissementId),
    compteursService(session),
  ]);
  const { langue, t } = await traducteurEquipeCourant(
    etablissement.langueEquipe,
  );
  const alertes = await alertesEquipe(session.etablissementId, langue);

  return (
    // data-espace : les fiches s'y ouvrent pour garder les couleurs de l'établissement et le sens d'écriture
    <div
      data-espace
      lang={langue}
      dir={FICHES_LANGUES[langue].sens}
      className="min-h-dvh"
      style={variablesEspace(ACCENT_EQUIPE, BOUTONS_EQUIPE)}
    >
      <header className="sticky top-0 z-20 border-b border-ligne/70 bg-white print:hidden">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-3 ps-5 pe-3">
          <Link href="/espace/accueil" className="flex min-w-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logos/logo-restaurant.svg"
              alt="Restaurant"
              className="h-11 w-auto max-w-full object-contain object-left"
            />
          </Link>
          <div className="flex items-center gap-2.5">
            <AlertesEquipe
              alertesInitiales={alertes}
              titrePage={`${etablissement.nom} · Tabla`}
              libelles={{
                nouvelleCommande: t("nouvelleCommande"),
                appelServeur: t("appelServeur"),
                appelAddition: t("appelAddition"),
                autresAlertes: formesPluriel(langue, "autresAlertes"),
                table: t("table"),
              }}
            />
            {/* « Restaurant » : tables, carte, paramètres, dans un écran temporaire */}
            <EcranRestaurant
              libelle={t("navRestaurant")}
              libelleFermer={t("fermer")}
              destinations={[
                { cle: "tables", libelle: t("navTables"), notifications: 0 },
                {
                  cle: "carte",
                  libelle: t("navCarte"),
                  notifications: compte.carte,
                },
                {
                  cle: "parametres",
                  libelle: t("parametres"),
                  notifications: 0,
                },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-8 pb-16 print:p-0">
        {children}
      </main>
    </div>
  );
}
