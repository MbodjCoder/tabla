// Contenu de la page temporaire « Tables » (accueil, ?page=tables).
// Tables : l'état de la salle d'un coup d'œil (addition en cours, appels), libérer une table
// quand les clients partent, et le QR code de chacune. Le design est celui des chambres de Lalla :
// une seule liste, une ligne par table.
import {
  BellRing,
  ChevronLeft,
  Plus,
  Printer,
  ReceiptText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { BoutonEnvoi } from "@/composants/espace/ActionsCommande";
import { MenuQrTable } from "@/composants/espace/MenuQrTable";
import { OngletsSegmentes } from "@/composants/espace/OngletsSegmentes";
import { bdd } from "@/lib/bdd";
import { formaterPrix } from "@/lib/format";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { exigerPersonnel } from "@/lib/session-personnel";
import {
  ajouterTable,
  libererTableDepuisEspace,
  supprimerTable,
} from "@/app/espace/actions";

type Vue = "occupees" | "libres";

export async function ContenuTables({
  parametres,
}: {
  parametres: { vue?: string };
}) {
  const { etablissementId, role } = await exigerPersonnel();
  const direction = role === "DIRECTION";
  const [etablissement, tables] = await Promise.all([
    bdd.etablissement.findUniqueOrThrow({
      where: { id: etablissementId },
      select: { langueEquipe: true, devise: true },
    }),
    bdd.table.findMany({
      where: { etablissementId },
      orderBy: [{ ordre: "asc" }, { numero: "asc" }],
      include: {
        // Service en cours : commandes non clôturées (les annulées ne comptent pas dans l'addition)
        commandes: {
          where: { cloturee: false, statut: { not: "ANNULEE" } },
          select: { montantTotal: true },
        },
        appels: { where: { traite: false }, select: { type: true } },
      },
    }),
  ]);
  const { langue, t } = await traducteurEquipeCourant(
    etablissement.langueEquipe,
  );

  // Une table est occupée dès qu'elle a commandé ou appelé pendant le service en cours
  const occupee = (table: (typeof tables)[number]) =>
    table.commandes.length > 0 || table.appels.length > 0;
  const parVue: Record<Vue, typeof tables> = {
    occupees: tables.filter(occupee),
    libres: tables.filter((table) => !occupee(table)),
  };
  const { vue: vueDemandee } = parametres;
  const vue: Vue =
    vueDemandee === "libres"
      ? "libres"
      : vueDemandee === "occupees"
        ? "occupees"
        : parVue.occupees.length
          ? "occupees"
          : "libres";

  return (
    <>
      <div className="flex justify-end">
        <Link
          href="/espace/tables/qr"
          className="texte-boutons-equipe flex h-10 items-center gap-2 rounded-full border border-ligne bg-surface px-4 text-encre shadow-carte transition hover:bg-creux"
        >
          <Printer className="size-4" /> {t("imprimerTousQr")}
        </Link>
      </div>

      <div className="mt-6">
        <OngletsSegmentes
          actif={vue}
          onglets={(
            [
              ["occupees", t("ongletOccupees")],
              ["libres", t("libres")],
            ] as const
          ).map(([cle, libelle]) => ({
            cle,
            libelle,
            href: `?page=tables&vue=${cle}`,
            nombre: parVue[cle].length,
          }))}
        />
      </div>

      {parVue[vue].length === 0 ? (
        <p className="texte-details-equipe mt-5 rounded-[24px] border border-ligne bg-surface px-5 py-8 text-center text-details-equipe">
          {vue === "occupees" ? t("aucuneTableOccupee") : t("aucuneTable")}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-ligne rounded-[24px] border border-ligne bg-surface shadow-carte">
          {parVue[vue].map((table) => {
            const addition = table.commandes.reduce(
              (total, commande) => total + commande.montantTotal,
              0,
            );
            const types = new Set(table.appels.map((appel) => appel.type));
            return (
              <li
                key={table.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4.5 sm:gap-x-5 sm:px-6"
              >
                <div className="w-12 shrink-0 sm:w-14">
                  <p className="texte-numeros text-numeros">{table.numero}</p>
                  {table.zone && (
                    <p className="texte-details-equipe mt-1 truncate text-details-equipe">
                      {table.zone}
                    </p>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {occupee(table) ? (
                    <>
                      <p className="texte-textes-equipe whitespace-nowrap tabular-nums text-textes-equipe">
                        {formaterPrix(addition, etablissement.devise, langue)}
                      </p>
                      <p className="texte-details-equipe text-details-equipe">
                        {t("commandesEnCours", { n: table.commandes.length })}
                      </p>
                    </>
                  ) : (
                    <p className="texte-details-equipe text-details-equipe">
                      {t("tableLibre")}
                    </p>
                  )}
                </div>

                {/* Appels en attente : visibles ici aussi, pour ne rien oublier en libérant la table */}
                {types.size > 0 && (
                  <span className="flex gap-1.5">
                    {types.has("SERVEUR") && (
                      <span
                        title={t("appelServeur")}
                        className="grid size-8 place-items-center rounded-full bg-alerte/10 text-alerte"
                      >
                        <BellRing className="size-4" />
                      </span>
                    )}
                    {types.has("ADDITION") && (
                      <span
                        title={t("appelAddition")}
                        className="grid size-8 place-items-center rounded-full bg-alerte/10 text-alerte"
                      >
                        <ReceiptText className="size-4" />
                      </span>
                    )}
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  {occupee(table) && (
                    <form action={libererTableDepuisEspace}>
                      <input type="hidden" name="tableId" value={table.id} />
                      <BoutonEnvoi className="texte-boutons-equipe flex h-10 items-center gap-1.5 rounded-xl border border-ligne px-3.5 transition hover:bg-creux disabled:opacity-60 sm:px-4">
                        {t("libererTable")}
                      </BoutonEnvoi>
                    </form>
                  )}
                  <MenuQrTable
                    tableId={table.id}
                    peutRegenerer={direction}
                    libelles={{
                      qrCode: t("qrCodeTable", { n: table.numero }),
                      imprimer: t("imprimerQr"),
                      regenerer: t("regenererQr"),
                      confirmer: t("confirmerRegenererQr"),
                      boutonConfirmer: t("regenerer"),
                      explication: t("explicationRegenererQr"),
                      annuler: t("annuler"),
                      regenere: t("qrRegenere"),
                      imprimerNouveau: t("imprimerNouveauQr"),
                    }}
                  />
                  {direction && !occupee(table) && (
                    <form action={supprimerTable}>
                      <input type="hidden" name="tableId" value={table.id} />
                      <BoutonEnvoi
                        title={t("supprimerTable")}
                        className="grid size-10 place-items-center rounded-xl text-encre-pale transition hover:bg-alerte/[0.06] hover:text-alerte"
                      >
                        <Trash2 className="size-[17px]" />
                      </BoutonEnvoi>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Nouvelle table : numéro et zone, son QR code est créé aussitôt */}
      {direction && (
        <form
          action={ajouterTable}
          className="mt-8 flex flex-wrap items-end gap-3 rounded-[24px] border border-ligne bg-surface p-5 shadow-carte sm:p-6"
        >
          <label className="texte-libelles-equipe block text-libelles-equipe">
            {t("numeroTable")}
            <input
              name="numero"
              required
              maxLength={12}
              className="texte-champs-equipe mt-1.5 block h-11 w-28 rounded-xl border border-ligne bg-fond px-3 outline-none focus:border-encre"
            />
          </label>
          <label className="texte-libelles-equipe block min-w-40 flex-1 text-libelles-equipe">
            {t("zoneTable")}
            <input
              name="zone"
              maxLength={40}
              placeholder={t("zonePlaceholder")}
              className="texte-champs-equipe mt-1.5 block h-11 w-full rounded-xl border border-ligne bg-fond px-3 outline-none placeholder:text-encre-pale focus:border-encre"
            />
          </label>
          <BoutonEnvoi className="texte-boutons-equipe flex h-11 items-center gap-1.5 rounded-xl bg-bouton px-5 text-texte-bouton transition hover:bg-bouton/90 active:scale-[0.98] disabled:opacity-60">
            <Plus className="size-4" strokeWidth={2.4} /> {t("ajouterTable")}
          </BoutonEnvoi>
        </form>
      )}
    </>
  );
}
