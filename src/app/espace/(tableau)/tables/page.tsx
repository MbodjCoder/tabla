import { redirect } from "next/navigation";

// Ancienne adresse : « tables » s'ouvre désormais en page temporaire sur l'accueil
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const recus = await searchParams;
  const suivants = new URLSearchParams({ page: "tables" });
  for (const cle of ["vue"] as const) {
    const valeur = recus[cle];
    if (valeur) suivants.set(cle, valeur);
  }
  redirect(`/espace/accueil?${suivants}`);
}
