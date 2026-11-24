import { redirect } from "next/navigation";

// Ancienne adresse : « carte » s'ouvre désormais en page temporaire sur l'accueil
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; categorie?: string; q?: string }>;
}) {
  const recus = await searchParams;
  const suivants = new URLSearchParams({ page: "carte" });
  for (const cle of ["vue", "categorie", "q"] as const) {
    const valeur = recus[cle];
    if (valeur) suivants.set(cle, valeur);
  }
  redirect(`/espace/accueil?${suivants}`);
}
