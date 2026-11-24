// Session du personnel : jeton JWT signé (HS256) dans un cookie httpOnly.
// Toute lecture de données de l'espace hôtel passe par exigerPersonnel(),
// qui fournit l'etablissementId : impossible de lire les données d'un autre établissement.
// Le compte est relu en base à chaque requête : un compte supprimé ou changé
// d'établissement perd l'accès aussitôt, et le rôle en vigueur est toujours le bon.
import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { bdd } from "@/lib/bdd";
import { env } from "@/lib/env";

const NOM_COOKIE = "tabla_session";
const DUREE_SECONDES = 60 * 60 * 12; // une journée de service
const cle = new TextEncoder().encode(env.SECRET_SESSION);

export type SessionPersonnel = {
  personnelId: string;
  etablissementId: string;
  nom: string;
  role: "DIRECTION" | "SERVICE";
};

export async function ouvrirSession(session: SessionPersonnel) {
  const jeton = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DUREE_SECONDES}s`)
    .sign(cle);

  (await cookies()).set(NOM_COOKIE, jeton, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SECONDES,
  });
}

export async function fermerSession() {
  (await cookies()).delete(NOM_COOKIE);
}

/** Session valide (signature, expiration, compte toujours existant), une seule lecture par requête. */
export const lireSession = cache(async (): Promise<SessionPersonnel | null> => {
  const jeton = (await cookies()).get(NOM_COOKIE)?.value;
  if (!jeton) return null;
  let personnelId: string;
  try {
    const { payload } = await jwtVerify<SessionPersonnel>(jeton, cle, {
      algorithms: ["HS256"],
    });
    personnelId = payload.personnelId;
  } catch {
    return null;
  }
  const personnel = await bdd.personnel.findUnique({
    where: { id: personnelId },
    select: {
      id: true,
      etablissementId: true,
      nom: true,
      role: true,
      etablissement: { select: { actif: true } },
    },
  });
  if (!personnel?.etablissement.actif) return null;
  return {
    personnelId: personnel.id,
    etablissementId: personnel.etablissementId,
    nom: personnel.nom,
    role: personnel.role,
  };
});

export async function exigerPersonnel(): Promise<SessionPersonnel> {
  const session = await lireSession();
  if (!session) redirect("/espace/connexion");
  return session;
}
