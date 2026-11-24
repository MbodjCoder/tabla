// Variables d'environnement validées au démarrage.
// WhatsApp est facultatif : sans identifiants, les notifications sont écrites dans les journaux.
import "server-only";
import { z } from "zod";

const schemaEnv = z.object({
  DATABASE_URL: z.string().min(1),
  // Connexions simultanées à PostgreSQL par instance du serveur
  BDD_CONNEXIONS_MAX: z.coerce.number().int().min(2).max(100).default(15),
  WHATSAPP_JETON: z.string().optional(),
  WHATSAPP_ID_NUMERO: z.string().optional(),
  WHATSAPP_MODELE_NOTIFICATION: z.string().default("tabla_nouvelle_commande"),
  URL_PUBLIQUE: z.string().default("http://localhost:3001"),
  SECRET_SESSION: z
    .string()
    .min(32, "SECRET_SESSION doit faire au moins 32 caractères"),
});

// Chaînes vides du .env traitées comme absentes
const brut = Object.fromEntries(
  Object.entries(process.env).filter(([, valeur]) => valeur !== ""),
);

export const env = schemaEnv.parse(brut);
