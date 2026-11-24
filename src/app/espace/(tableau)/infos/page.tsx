import { redirect } from "next/navigation";

// Ancienne adresse : « infos » s'ouvre désormais en page temporaire sur l'accueil
export default function Page() {
  const suivants = new URLSearchParams({ page: "parametres" });
  redirect(`/espace/accueil?${suivants}`);
}
