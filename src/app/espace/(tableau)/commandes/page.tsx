import { redirect } from "next/navigation";

// Ancienne adresse : « commandes » s'ouvre désormais en page temporaire sur l'accueil
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; h?: string }>;
}) {
  const { vue, h } = await searchParams;
  const suivants = new URLSearchParams({
    page: vue === "preparation" || vue === "appels" ? vue : "nouvelles",
  });
  if (h) suivants.set("h", h);
  redirect(`/espace/accueil?${suivants}`);
}
