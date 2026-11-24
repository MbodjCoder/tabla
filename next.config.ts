import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// En-têtes de sécurité appliqués à toutes les réponses.
const ENTETES_SECURITE = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), interest-cohort=()" },
  // HTTPS imposé aux navigateurs, en production uniquement (le développement reste en http)
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
];

// Développement : un téléphone du même réseau peut ouvrir l'application via l'adresse du PC
const adressesLocales = Object.values(networkInterfaces())
  .flat()
  .flatMap((interfaceReseau) =>
    interfaceReseau?.family === "IPv4" && !interfaceReseau.internal ? [interfaceReseau.address] : [],
  );

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: adressesLocales,
  reactStrictMode: true,
  devIndicators: false,
  async headers() {
    return [
      { source: "/:chemin*", headers: ENTETES_SECURITE },
      // Photos du catalogue : mises en cache par le téléphone, revalidées au bout d'une semaine
      // (un réseau saturé ne les retélécharge pas à chaque visite)
      {
        source: "/images/:chemin*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default nextConfig;
