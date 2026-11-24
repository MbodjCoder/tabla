// Contenu de la page temporaire « Paramètres » (accueil, ?page=parametres) : la carte de départ à
// valider (direction), la langue, l'apparence et les informations de l'établissement (direction) ;
// en bas, le compte connecté avec sa déconnexion, dans un seul bloc.
import {
  Check,
  ChevronRight,
  Languages,
  LogOut,
  Palette,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { seDeconnecter, toutValiderCarte } from "@/app/espace/actions";
import { SelecteurLangueEquipe } from "@/composants/espace/SelecteurLangueEquipe";
import { bdd } from "@/lib/bdd";
import { compteursService, lireEtablissement } from "@/lib/compteurs-service";
import { traducteurEquipeCourant } from "@/lib/langue-equipe";
import { exigerPersonnel } from "@/lib/session-personnel";

const CARTE = "rounded-[22px] border border-ligne bg-surface shadow-carte";
const PASTILLE_ICONE =
  "grid size-10 shrink-0 place-items-center rounded-full bg-bouton/10 text-bouton";

export async function ContenuParametres() {
  const session = await exigerPersonnel();
  const direction = session.role === "DIRECTION";
  const [etablissement, personnel, compte] = await Promise.all([
    lireEtablissement(session.etablissementId),
    bdd.personnel.findUniqueOrThrow({
      where: { id: session.personnelId },
      select: { email: true },
    }),
    compteursService(session),
  ]);
  const { langue, t } = await traducteurEquipeCourant(
    etablissement.langueEquipe,
  );
  const initiales = session.nom
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join("");

  // Réglages de la direction : chacun ouvre sa page
  const reglages: {
    href: string;
    icone: LucideIcon;
    libelle: string;
    detail: string;
  }[] = direction
    ? [
        {
          href: "/espace/informations#apparence",
          icone: Palette,
          libelle: t("couleursTheme"),
          detail: t("detailCouleurs"),
        },
        {
          href: "/espace/informations",
          icone: Store,
          libelle: t("informationsTitre"),
          detail: t("detailInformations"),
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {/* La carte de départ, proposée à l'ouverture du compte, que la direction valide d'un geste */}
      {compte.carte > 0 && (
        <section className={`${CARTE} flex flex-col gap-3 px-5 py-4`}>
          <div className="flex items-center gap-4">
            <span className={PASTILLE_ICONE} aria-hidden>
              <UtensilsCrossed className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="texte-textes-equipe text-textes-equipe">
                {t("cartePreparee")}
              </p>
              <p className="texte-details-equipe text-details-equipe">
                {t("elementsAVerifier", { n: compte.carte })}
              </p>
            </div>
          </div>
          <form action={toutValiderCarte}>
            <button className="texte-boutons-equipe flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-bouton px-4 text-texte-bouton transition active:scale-[0.98]">
              <Check className="size-4" /> {t("toutValider")}
            </button>
          </form>
        </section>
      )}

      {/* Langue de l'espace, mémorisée sur cet appareil */}
      <section className={`${CARTE} flex items-center gap-4 px-5 py-3.5`}>
        <span className={PASTILLE_ICONE} aria-hidden>
          <Languages className="size-5" strokeWidth={2.3} />
        </span>
        <span className="texte-textes-equipe min-w-0 flex-1 text-textes-equipe">
          {t("langue")}
        </span>
        <SelecteurLangueEquipe langue={langue} libelle={t("choisirLangue")} />
      </section>

      {reglages.map(({ href, icone: Icone, libelle, detail }) => (
        <Link
          key={href}
          href={href}
          className={`${CARTE} flex items-center gap-4 px-5 py-3.5 transition hover:border-encre/20 active:scale-[0.99]`}
        >
          <span className={PASTILLE_ICONE} aria-hidden>
            <Icone className="size-5" strokeWidth={2.3} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="texte-textes-equipe block text-textes-equipe">
              {libelle}
            </span>
            <span className="texte-details-equipe block truncate text-details-equipe">
              {detail}
            </span>
          </span>
          <ChevronRight
            className="size-5 shrink-0 text-encre-pale rtl:-scale-x-100"
            aria-hidden
          />
        </Link>
      ))}

      {/* Le compte connecté et sa déconnexion, ensemble, en bas */}
      <section
        className={`${CARTE} mt-6 flex items-center gap-4 py-3.5 ps-5 pe-3`}
      >
        <span className="texte-libelles-equipe grid size-12 shrink-0 place-items-center rounded-full bg-bouton/10 text-bouton">
          {initiales}
        </span>
        <div className="min-w-0 flex-1">
          <p className="texte-textes-equipe truncate text-textes-equipe">
            {session.nom}
          </p>
          <p className="texte-details-equipe truncate text-details-equipe">
            {personnel.email}
          </p>
        </div>
        <form action={seDeconnecter}>
          <button
            aria-label={t("seDeconnecter")}
            title={t("seDeconnecter")}
            className="grid size-11 place-items-center rounded-full bg-alerte/10 text-alerte transition hover:bg-alerte/15 active:scale-90"
          >
            <LogOut
              className="size-5 rtl:-scale-x-100"
              strokeWidth={2.4}
              aria-hidden
            />
          </button>
        </form>
      </section>
    </div>
  );
}
