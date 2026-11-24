// Informations de l'établissement (direction) : identité, apparence, contacts.
// Accessible depuis « Paramètres » ; la flèche y ramène.
import { redirect } from "next/navigation";
import { EnTetePage } from "@/composants/espace/EnTetePage";
import { InformationsEtablissement } from "@/composants/espace/informations/InformationsEtablissement";
import { bdd } from "@/lib/bdd";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { exigerPersonnel } from "@/lib/session-personnel";
import { lireTypographie } from "@/lib/typographie";

export const dynamic = "force-dynamic";

export default async function PageInformations() {
  const { etablissementId, role } = await exigerPersonnel();
  if (role !== "DIRECTION") redirect("/espace/accueil?page=parametres");
  const etablissement = await bdd.etablissement.findUniqueOrThrow({
    where: { id: etablissementId },
  });
  const { langue, t } = await traducteurEquipeCourant(
    etablissement.langueEquipe,
  );

  return (
    <>
      <EnTetePage
        retour="/espace/accueil?page=parametres"
        libelleRetour={t("parametres")}
        titre={t("informationsTitre")}
      />
      <InformationsEtablissement
        langue={langue}
        valeurs={{
          nom: etablissement.nom,
          ville: etablissement.ville,
          langueEquipe: etablissement.langueEquipe,
          telephone: etablissement.telephone ?? "",
          whatsappCommandes: etablissement.whatsappCommandes ?? "",
        }}
        couleurs={{
          couleurAccent: etablissement.couleurAccent,
          couleurFond: etablissement.couleurFond,
          couleurHoraires: etablissement.couleurHoraires,
          couleurBoutons: etablissement.couleurBoutons,
          couleurTexte: etablissement.couleurTexte,
          couleurTitres: etablissement.couleurTitres,
        }}
        typographie={lireTypographie(etablissement.typographie)}
      />
    </>
  );
}
