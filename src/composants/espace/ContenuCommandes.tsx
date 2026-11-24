// Contenu des pages temporaires du service (accueil) : nouvelles commandes (à accepter),
// en cours (à servir), appels des tables. Premières arrivées, premières servies : les plus
// anciennes en haut. L'historique du jour, replié et cherchable, suit les commandes. Le design est
// celui de l'espace de Lalla (cartes, typographie et boutons de l'équipe).
import {
  BellRing,
  Check,
  ChevronDown,
  History,
  ReceiptText,
} from "lucide-react";
import {
  ActionsCommande,
  BoutonEnvoi,
} from "@/composants/espace/ActionsCommande";
import { RechercheDepliable } from "@/composants/espace/RechercheDepliable";
import { bdd } from "@/lib/bdd";
import { formaterPrix, sansAccents } from "@/lib/format";
import type { TraduireEquipe } from "@/lib/i18n/equipe";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import {
  choisirTraduction,
  estLangueClient,
  FICHES_LANGUES,
  nomDeLangue,
  type LangueEquipe,
} from "@/lib/langues";
import { exigerPersonnel } from "@/lib/session-personnel";
import type { Prisma } from "@/generated/prisma/client";
import {
  deciderCommandeDepuisEspace,
  traiterAppelDepuisEspace,
} from "@/app/espace/actions";

export const VUES_SERVICE = ["nouvelles", "preparation", "appels"] as const;
export type VueService = (typeof VUES_SERVICE)[number];

// Au-delà, l'attente s'affiche en rouge
const SEUIL_RETARD_MIN = 10;
const HISTORIQUE_MAX = 50;
// Bien au-delà d'un service réel : la page reste rapide quoi qu'il arrive
const EN_COURS_MAX = 150;
const HISTORIQUE_RECHERCHE_MAX = 200;

const inclusion = {
  lignes: true,
  table: { select: { numero: true, zone: true } },
} satisfies Prisma.CommandeInclude;
type CommandeAffichee = Prisma.CommandeGetPayload<{
  include: typeof inclusion;
}>;

type Horloge = { locale: string; fuseau: string };

/** « il y a 12 min », « il y a 1 h 05 », au-delà de 24 h la date exacte. */
function moment(depuis: Date, t: TraduireEquipe, horloge: Horloge) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - depuis.getTime()) / 60_000),
  );
  if (minutes < 1) return { texte: t("delaiInstant"), minutes };
  if (minutes < 60) return { texte: t("ilYaMinutes", { n: minutes }), minutes };
  if (minutes < 24 * 60) {
    return {
      texte: t("ilYaHeures", {
        h: Math.floor(minutes / 60),
        m: String(minutes % 60).padStart(2, "0"),
      }),
      minutes,
    };
  }
  const texte = new Intl.DateTimeFormat(horloge.locale, {
    timeZone: horloge.fuseau,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(depuis);
  return { texte, minutes };
}

export async function ContenuCommandes({
  vue,
  h,
}: {
  vue: VueService;
  h?: string;
}) {
  const { etablissementId } = await exigerPersonnel();
  const etablissement = await bdd.etablissement.findUniqueOrThrow({
    where: { id: etablissementId },
  });
  const { langue, t } = await traducteurEquipeCourant(
    etablissement.langueEquipe,
  );
  const horloge: Horloge = {
    locale: FICHES_LANGUES[langue].locale,
    fuseau: etablissement.fuseauHoraire,
  };
  const jour = new Intl.DateTimeFormat("en-CA", {
    timeZone: etablissement.fuseauHoraire,
  }).format(new Date());
  const debutJour = new Date(`${jour}T00:00:00Z`);
  const parametres = { h };
  const recherche = sansAccents(parametres.h?.trim() ?? "");

  const [nouvelles, enPreparation, appels, historique] = await Promise.all([
    bdd.commande.findMany({
      where: { etablissementId, statut: "ENVOYEE", cloturee: false },
      include: inclusion,
      orderBy: { creeLe: "asc" },
      take: EN_COURS_MAX,
    }),
    bdd.commande.findMany({
      where: { etablissementId, statut: "ACCEPTEE", cloturee: false },
      include: inclusion,
      orderBy: { accepteeLe: "asc" },
      take: EN_COURS_MAX,
    }),
    bdd.appel.findMany({
      where: { etablissementId, traite: false },
      include: { table: { select: { numero: true, zone: true } } },
      orderBy: { creeLe: "asc" },
      take: EN_COURS_MAX,
    }),
    // Servies ou annulées : aujourd'hui, ou plus loin quand on cherche
    bdd.commande.findMany({
      where: {
        etablissementId,
        statut: { in: ["SERVIE", "ANNULEE"] },
        ...(recherche ? {} : { creeLe: { gte: debutJour } }),
      },
      include: inclusion,
      orderBy: { creeLe: "desc" },
      take: recherche ? HISTORIQUE_RECHERCHE_MAX : HISTORIQUE_MAX,
    }),
  ]);

  const libellesActions = {
    accepter: t("accepter"),
    servie: t("marquerServie"),
    refuser: t("refuser"),
    retour: t("retour"),
    confirmerRefus: t("refuser"),
    questionRefus: t("questionRefus"),
  };
  const historiqueAffiche = recherche
    ? historique.filter((commande) =>
        sansAccents(
          [
            commande.table.numero,
            String(commande.numero),
            commande.note,
            ...commande.lignes.map(
              (ligne) =>
                `${ligne.libelle} ${JSON.stringify(ligne.traductions)}`,
            ),
          ]
            .filter(Boolean)
            .join(" "),
        ).includes(recherche),
      )
    : historique;

  const carte = (commande: CommandeAffichee) => (
    <CarteCommande
      key={commande.id}
      commande={commande}
      attente={moment(
        commande.statut === "ACCEPTEE" ? commande.accepteeLe! : commande.creeLe,
        t,
        horloge,
      )}
      devise={etablissement.devise}
      langue={langue}
      t={t}
      actions={
        <ActionsCommande
          commandeId={commande.id}
          statut={commande.statut}
          libelles={libellesActions}
          action={deciderCommandeDepuisEspace}
        />
      }
    />
  );

  return (
    <>
      <div className="space-y-3">
        {vue === "nouvelles" &&
          (nouvelles.length ? (
            nouvelles.map(carte)
          ) : (
            <Calme texte={t("aucuneNouvelleCommande")} />
          ))}
        {vue === "preparation" &&
          (enPreparation.length ? (
            enPreparation.map(carte)
          ) : (
            <Calme texte={t("rienEnPreparation")} />
          ))}
        {vue === "appels" &&
          (appels.length ? (
            appels.map((appel) => {
              const Icone = appel.type === "ADDITION" ? ReceiptText : BellRing;
              const { texte, minutes } = moment(appel.creeLe, t, horloge);
              return (
                <article
                  key={appel.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] border border-ligne bg-surface px-4 py-4 shadow-carte sm:px-6"
                >
                  <span className="texte-numeros w-12 shrink-0 text-numeros">
                    {appel.table.numero}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="texte-textes-equipe flex items-center gap-2 text-textes-equipe">
                      <Icone
                        className="size-[18px] shrink-0 text-bouton"
                        strokeWidth={2.2}
                        aria-hidden
                      />
                      {appel.type === "ADDITION"
                        ? t("appelAddition")
                        : t("appelServeur")}
                    </p>
                    <p className="texte-details-equipe mt-1 text-details-equipe">
                      {t("table")} {appel.table.numero}
                      {appel.table.zone ? ` · ${appel.table.zone}` : ""}
                    </p>
                  </div>
                  <PastilleAttente
                    texte={texte}
                    enRetard={minutes >= SEUIL_RETARD_MIN}
                  />
                  <form action={traiterAppelDepuisEspace}>
                    <input type="hidden" name="appelId" value={appel.id} />
                    <BoutonEnvoi className="texte-boutons-equipe flex h-10 items-center gap-1.5 rounded-xl bg-bouton px-4 text-texte-bouton transition hover:bg-bouton/90 active:scale-[0.98] disabled:opacity-60">
                      <Check className="size-4" strokeWidth={2.6} /> {t("fait")}
                    </BoutonEnvoi>
                  </form>
                </article>
              );
            })
          ) : (
            <Calme texte={t("aucunAppel")} />
          ))}
      </div>

      {/* Le travail terminé, replié sur une ligne : consultable et cherchable sans encombrer le service
          (pas sous les appels) */}
      {vue !== "appels" && (
        <details open={Boolean(recherche)} className="group mt-10">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-[20px] bg-creux/70 px-4 py-3.5 transition hover:bg-creux [&::-webkit-details-marker]:hidden">
            <History
              className="size-5 shrink-0 text-encre-douce"
              strokeWidth={2}
              aria-hidden
            />
            <span className="texte-textes-equipe flex-1 text-textes-equipe">
              {t("historique")}
            </span>
            <span className="texte-details-equipe whitespace-nowrap tabular-nums text-details-equipe">
              {recherche
                ? t("resultatsHistorique", { n: historiqueAffiche.length })
                : t("historiqueAujourdhui", { n: historique.length })}
            </span>
            <ChevronDown
              className="size-5 shrink-0 text-encre-pale transition group-open:rotate-180"
              aria-hidden
            />
          </summary>

          <div className="mt-3 flex justify-end">
            <RechercheDepliable
              parametre="h"
              libelles={{
                rechercher: t("rechercher"),
                placeholder: t("rechercherHistorique"),
                fermer: t("fermerRecherche"),
              }}
            />
          </div>

          {historiqueAffiche.length === 0 ? (
            <p className="texte-details-equipe mt-3 rounded-[20px] border border-dashed border-ligne px-5 py-6 text-center text-details-equipe">
              {recherche
                ? t("aucunResultat", { q: parametres.h?.trim() ?? "" })
                : t("aucunHistorique")}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {historiqueAffiche.map((commande) => (
                <li
                  key={commande.id}
                  className="flex items-center gap-4 rounded-[18px] border border-ligne bg-surface px-4 py-3 shadow-carte sm:px-5"
                >
                  <span className="texte-numeros w-11 shrink-0 text-numeros">
                    {commande.table.numero}
                  </span>
                  {/* Deux lignes : le détail garde toute la largeur, même sur téléphone */}
                  <span className="min-w-0 flex-1">
                    <span className="texte-courant-equipe block truncate text-courant-equipe">
                      {resumeLignes(commande, langue)}
                    </span>
                    <span className="texte-details-equipe block tabular-nums text-details-equipe">
                      #{commande.numero} ·{" "}
                      {formaterPrix(
                        commande.montantTotal,
                        etablissement.devise,
                        langue,
                      )}
                    </span>
                  </span>
                  {commande.statut === "SERVIE" ? (
                    <span className="texte-etiquettes-equipe inline-flex shrink-0 items-center gap-1 rounded-full bg-succes/10 px-2.5 py-0.5 text-succes">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                      {t("servie")}
                    </span>
                  ) : (
                    <span className="texte-etiquettes-equipe shrink-0 rounded-full bg-creux px-2.5 py-0.5 text-encre-douce">
                      {t("annulee")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </details>
      )}
    </>
  );
}

const resumeLignes = (commande: CommandeAffichee, langue: LangueEquipe) =>
  commande.lignes
    .map(
      (ligne) =>
        `${ligne.quantite} × ${choisirTraduction(ligne.traductions as Partial<Record<string, string>>, langue, ligne.libelle)}`,
    )
    .join(", ");

/** Une commande : la table en grand, le détail lisible de loin, et la décision. */
function CarteCommande({
  commande,
  attente,
  devise,
  langue,
  t,
  actions,
}: {
  commande: CommandeAffichee;
  attente: { texte: string; minutes: number };
  devise: string;
  langue: LangueEquipe;
  t: TraduireEquipe;
  actions: React.ReactNode;
}) {
  const langueClient =
    estLangueClient(commande.langueClient) && commande.langueClient !== langue
      ? commande.langueClient
      : null;
  return (
    <article className="rounded-[22px] border border-ligne bg-surface px-4 py-4 shadow-carte sm:px-6">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="texte-numeros text-numeros">
          {commande.table.numero}
        </span>
        <span className="texte-details-equipe text-details-equipe">
          {t("table")}
          {commande.table.zone ? ` · ${commande.table.zone}` : ""}
        </span>
        <span className="ms-auto flex items-center gap-2">
          <span className="texte-details-equipe font-semibold tabular-nums text-details-equipe">
            #{commande.numero}
          </span>
          <PastilleAttente
            texte={attente.texte}
            enRetard={attente.minutes >= SEUIL_RETARD_MIN}
          />
        </span>
      </header>

      <ul className="mt-3 space-y-1">
        {commande.lignes.map((ligne) => (
          <li
            key={ligne.id}
            className="texte-textes-equipe flex gap-2.5 leading-snug text-textes-equipe"
          >
            <span className="w-8 shrink-0 tabular-nums">{ligne.quantite}×</span>
            <span className="min-w-0 flex-1">
              {choisirTraduction(
                ligne.traductions as Partial<Record<string, string>>,
                langue,
                ligne.libelle,
              )}
            </span>
          </li>
        ))}
      </ul>
      {commande.note && (
        <p className="texte-courant-equipe mt-3 rounded-xl bg-[#fdf3dc] px-3.5 py-2.5 text-courant-equipe">
          « {commande.note} »
          {langueClient && (
            <span className="texte-details-equipe ms-1 text-details-equipe">
              ({nomDeLangue(langueClient, langue)})
            </span>
          )}
        </p>
      )}

      <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ligne pt-3">
        <p className="texte-textes-equipe tabular-nums text-textes-equipe">
          {formaterPrix(commande.montantTotal, devise, langue)}
        </p>
        {actions}
      </footer>
    </article>
  );
}

function PastilleAttente({
  texte,
  enRetard,
}: {
  texte: string;
  enRetard: boolean;
}) {
  return (
    <span
      className={`texte-etiquettes-equipe rounded-full px-2.5 py-0.5 tabular-nums ${
        enRetard ? "bg-alerte/12 text-alerte" : "bg-creux text-encre-douce"
      }`}
    >
      {texte}
    </span>
  );
}

function Calme({ texte }: { texte: string }) {
  return (
    <p className="texte-textes-equipe rounded-[24px] border border-ligne bg-surface px-6 py-8 text-center text-textes-equipe shadow-carte">
      {texte}
    </p>
  );
}
