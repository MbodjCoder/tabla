// Point d'entrée du client : l'adresse encodée dans le QR code posé sur la table.
// Rendu serveur complet de la carte (et de ses traductions) : premier affichage immédiat.
import type { Metadata, Viewport } from "next";
import { MenuTable } from "@/composants/client/MenuTable";
import { QrInvalide } from "@/composants/client/QrInvalide";
import { bdd } from "@/lib/bdd";
import { resoudreTable } from "@/lib/contexte-table";
import {
  declarationsCss,
  FOND_PAR_DEFAUT,
  fondAssezClair,
  variablesCouleurs,
} from "@/lib/couleurs";
import type { CategorieVue } from "@/lib/types";
import { lireTypographie, variablesTypographie } from "@/lib/typographie";

export const dynamic = "force-dynamic";

type Proprietes = { params: Promise<{ jeton: string }> };

export async function generateMetadata({
  params,
}: Proprietes): Promise<Metadata> {
  const contexte = await resoudreTable((await params).jeton);
  return {
    title: contexte ? `Restaurant · Table ${contexte.table.numero}` : "Tabla",
  };
}

// Barre du navigateur mobile couleur du fond de la carte : le haut de l'écran ne fait qu'un avec elle
export async function generateViewport({
  params,
}: Proprietes): Promise<Viewport> {
  const contexte = await resoudreTable((await params).jeton);
  const fond = contexte?.etablissement.couleurFond;
  return {
    themeColor: fond && fondAssezClair(fond) ? fond : FOND_PAR_DEFAUT,
  };
}

export default async function PageTable({ params }: Proprietes) {
  const { jeton } = await params;
  const contexte = await resoudreTable(jeton);
  if (!contexte) return <QrInvalide />;

  const { etablissement, table } = contexte;
  const categories = await bdd.categorieCatalogue.findMany({
    where: { etablissementId: etablissement.id, articles: { some: {} } },
    orderBy: [{ ordre: "asc" }, { id: "asc" }],
    include: { articles: { orderBy: [{ ordre: "asc" }, { id: "asc" }] } },
  });

  const carte: CategorieVue[] = categories.map((categorie) => ({
    id: categorie.id,
    nom: categorie.nom,
    horaires: categorie.horaires,
    traductions: categorie.traductions as CategorieVue["traductions"],
    articles: categorie.articles.map((article) => ({
      id: article.id,
      nom: article.nom,
      description: article.description,
      prix: article.prix,
      photo: article.photo,
      disponible: article.disponible,
      traductions:
        article.traductions as CategorieVue["articles"][number]["traductions"],
    })),
  }));

  return (
    <div className="min-h-dvh bg-fond">
      {/* Couleurs et polices posées sur :root : le fond couvre toute la page, rebond du défilement compris */}
      <style>{`:root{${declarationsCss({
        ...variablesCouleurs(etablissement),
        ...variablesTypographie(lireTypographie(etablissement.typographie)),
      })}}`}</style>
      <MenuTable
        jeton={jeton}
        numeroTable={table.numero}
        devise={etablissement.devise}
        categories={carte}
      />
    </div>
  );
}
