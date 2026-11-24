import type { MetadataRoute } from "next";

export default function manifeste(): MetadataRoute.Manifest {
  return {
    name: "Tabla — Commande à table",
    short_name: "Tabla",
    description:
      "Toute la carte, dans votre langue : commandez depuis votre table.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8f3",
    theme_color: "#f7f8f3",
    icons: [{ src: "/icone.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
