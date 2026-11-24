import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Tabla — La commande à table, par QR code" };

const ARGUMENTS = [
  {
    titre: "Le client commande quand il veut",
    texte:
      "Il scanne le QR de sa table, parcourt la carte illustrée dans sa langue et envoie sa commande, sans attendre qu'on passe.",
  },
  {
    titre: "L'équipe reçoit tout, au bon endroit",
    texte:
      "Chaque commande arrive avec son numéro de table et une alerte sonore : un geste pour l'accepter, un autre quand elle est servie.",
  },
  {
    titre: "Moins d'allers-retours, plus de couverts",
    texte:
      "Appel du serveur, demande d'addition, plats épuisés retirés en un geste : la salle tourne mieux, les erreurs disparaissent.",
  },
];

export default function PageProduit() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10"
      style={{ "--accent-hotel": "#1d4e89" } as React.CSSProperties}
    >
      <p className="font-serif text-[28px] italic">Tabla</p>

      <section className="mt-20 animate-apparition">
        <h1 className="font-serif text-[52px] leading-[1.02] tracking-[-0.01em] sm:text-[72px]">
          La carte dans la main,
          <br />
          <em className="text-accent-profond">la commande à la table.</em>
        </h1>
        <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-encre-douce">
          Un QR code sur chaque table, aucune application. Vos clients voient
          toute la carte, commandent et suivent leur commande ; votre équipe la
          reçoit aussitôt, avec le numéro de table.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/t/demotable5"
            className="flex h-14 items-center gap-2 rounded-2xl bg-encre px-6 text-[16px] font-semibold text-white transition active:scale-[0.98]"
          >
            Essayer la table de démonstration <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/espace"
            className="flex h-14 items-center rounded-2xl border border-ligne bg-surface px-6 text-[16px] font-semibold"
          >
            Espace équipe
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-8 sm:grid-cols-3">
        {ARGUMENTS.map(({ titre, texte }) => (
          <div key={titre}>
            <h2 className="text-[16px] font-bold">{titre}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-encre-douce">
              {texte}
            </p>
          </div>
        ))}
      </section>

      <p className="mt-auto pt-24 text-[13px] text-encre-pale">
        Conçu à Dakar pour les restaurants sénégalais.
      </p>
    </main>
  );
}
