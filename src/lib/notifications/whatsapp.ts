// Notifications WhatsApp vers le personnel (Meta Cloud API).
//
// Règle Meta : un message à l'initiative de l'entreprise, hors fenêtre de
// 24 h, DOIT utiliser un modèle (template) pré-approuvé. Modèle attendu,
// catégorie « Utility », langue fr :
//   « {{1}} — {{2}}. Détails et prise en charge : {{3}} »
//
// Sans identifiants configurés, le message est écrit dans la console
// (mode développement) : le reste du parcours fonctionne à l'identique.
import "server-only";
import { env } from "@/lib/env";

const VERSION_API = "v21.0";

export type NotificationPersonnel = {
  destinataire: string; // numéro international sans « + »
  titre: string; // « Chambre 304 · Nouvelle commande »
  details: string[]; // lignes de détail
  lien: string; // lien d'action (prise en charge)
};

export async function envoyerNotification(
  notification: NotificationPersonnel,
): Promise<boolean> {
  if (!env.WHATSAPP_JETON || !env.WHATSAPP_ID_NUMERO) {
    journaliserEnConsole(notification);
    return true;
  }

  // Les paramètres de modèle Meta n'acceptent ni retour à la ligne ni tabulation
  const detailsAplatis = notification.details.join(" · ").slice(0, 900);

  const reponse = await fetch(
    `https://graph.facebook.com/${VERSION_API}/${env.WHATSAPP_ID_NUMERO}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_JETON}`,
        "Content-Type": "application/json",
      },
      // Meta lent ou injoignable : la demande reste visible dans l'espace hôtel, on n'attend pas
      signal: AbortSignal.timeout(10 * 1000),
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: notification.destinataire,
        type: "template",
        template: {
          name: env.WHATSAPP_MODELE_NOTIFICATION,
          language: { code: "fr" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: notification.titre },
                { type: "text", text: detailsAplatis },
                { type: "text", text: notification.lien },
              ],
            },
          ],
        },
      }),
    },
  );

  if (!reponse.ok) {
    console.error(
      "[whatsapp] échec d'envoi",
      reponse.status,
      await reponse.text(),
    );
    return false;
  }
  return true;
}

function journaliserEnConsole({
  destinataire,
  titre,
  details,
  lien,
}: NotificationPersonnel) {
  const cadre = "─".repeat(52);
  console.info(
    [
      `\n┌${cadre}`,
      `│ WhatsApp (mode console) → +${destinataire}`,
      `│ ${titre}`,
      ...details.map((ligne) => `│   ${ligne}`),
      `│ → ${lien}`,
      `└${cadre}\n`,
    ].join("\n"),
  );
}
