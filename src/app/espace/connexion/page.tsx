import { redirect } from "next/navigation";
import { SelecteurLangueEquipe } from "@/composants/espace/SelecteurLangueEquipe";
import { FormulaireConnexion } from "@/composants/espace/FormulaireConnexion";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { lireSession } from "@/lib/session-personnel";

export const metadata = { title: "Tabla · Espace équipe" };

export default async function PageConnexion() {
  if (await lireSession()) redirect("/espace/commandes");
  const { langue, t } = await traducteurEquipeCourant();

  return (
    <main className="relative grid min-h-dvh place-items-center px-6">
      <div className="absolute end-5 top-5">
        <SelecteurLangueEquipe langue={langue} libelle={t("choisirLangue")} />
      </div>
      <div className="w-full max-w-sm animate-apparition">
        <p className="font-serif text-[56px] italic leading-none text-encre">
          Tabla
        </p>
        <p className="mt-2 text-[15px] text-encre-douce">
          {t("connexionSousTitre")}
        </p>
        <FormulaireConnexion
          libelles={{
            email: t("email"),
            motDePasse: t("motDePasse"),
            seConnecter: t("seConnecter"),
          }}
        />
      </div>
    </main>
  );
}
