"use client";

// QR code d'une table : un seul bouton, deux gestes. Imprimer le chevalet, ou (direction)
// régénérer le code, après confirmation car l'ancien cesse aussitôt de fonctionner ;
// le nouveau se propose ensuite à l'impression, pour enchaîner sans chercher.
import {
  Check,
  Loader2,
  Printer,
  QrCode,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { regenererQr } from "@/app/espace/actions";

type Etape = "menu" | "confirmation" | "fait";

// Espace à garder sous le bouton pour ouvrir le menu vers le bas (sinon, il s'ouvre vers le haut)
const HAUTEUR_MENU_PX = 260;

export function MenuQrTable({
  tableId,
  peutRegenerer,
  libelles,
}: {
  tableId: string;
  peutRegenerer: boolean;
  libelles: {
    qrCode: string;
    imprimer: string;
    regenerer: string;
    confirmer: string;
    boutonConfirmer: string;
    explication: string;
    annuler: string;
    regenere: string;
    imprimerNouveau: string;
  };
}) {
  const [ouvert, setOuvert] = useState(false);
  const [etape, setEtape] = useState<Etape>("menu");
  const [versLeHaut, setVersLeHaut] = useState(false);
  const [enCours, demarrer] = useTransition();
  const racine = useRef<HTMLDivElement>(null);
  const lienImpression = `/espace/tables/${tableId}/qr`;

  const fermer = () => {
    setOuvert(false);
    setEtape("menu");
  };

  // Fermeture au clic à côté ou avec Échap (sauf pendant la régénération)
  useEffect(() => {
    if (!ouvert) return;
    const clic = (evenement: PointerEvent) => {
      if (!enCours && !racine.current?.contains(evenement.target as Node))
        fermer();
    };
    const touche = (evenement: KeyboardEvent) =>
      evenement.key === "Escape" && !enCours && fermer();
    document.addEventListener("pointerdown", clic);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("pointerdown", clic);
      document.removeEventListener("keydown", touche);
    };
  }, [ouvert, enCours]);

  const basculer = () => {
    if (ouvert) return fermer();
    const bas = racine.current?.getBoundingClientRect().bottom ?? 0;
    setVersLeHaut(window.innerHeight - bas < HAUTEUR_MENU_PX);
    setOuvert(true);
  };

  const regenerer = () =>
    demarrer(async () => {
      const donnees = new FormData();
      donnees.set("tableId", tableId);
      await regenererQr(donnees);
      setEtape("fait");
    });

  const ligne =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[14.5px] font-semibold text-encre transition hover:bg-creux";

  return (
    <div ref={racine} className="relative">
      <button
        type="button"
        onClick={basculer}
        aria-label={libelles.qrCode}
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        title={libelles.qrCode}
        className={`grid size-10 place-items-center rounded-xl transition ${
          ouvert ? "bg-creux text-encre" : "text-encre-douce hover:bg-creux"
        }`}
      >
        <QrCode className="size-[19px]" />
      </button>

      {ouvert && (
        <div
          role="dialog"
          aria-label={libelles.qrCode}
          className={`absolute end-0 z-30 w-[min(300px,calc(100vw-40px))] animate-montee rounded-2xl border border-ligne bg-surface p-1.5 shadow-[0_12px_40px_-12px_rgb(26_27_23/0.28)] ${
            versLeHaut ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {etape === "menu" && (
            <>
              <p className="px-3 pt-2 pb-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-encre-pale">
                {libelles.qrCode}
              </p>
              <Link href={lienImpression} onClick={fermer} className={ligne}>
                <Printer className="size-[18px] text-encre-douce" />{" "}
                {libelles.imprimer}
              </Link>
              {peutRegenerer && (
                <button
                  type="button"
                  onClick={() => setEtape("confirmation")}
                  className={ligne}
                >
                  <RefreshCw className="size-[18px] text-encre-douce" />{" "}
                  {libelles.regenerer}
                </button>
              )}
            </>
          )}

          {etape === "confirmation" && (
            <div className="p-3">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-encre">
                <TriangleAlert
                  className="size-[18px] shrink-0 text-alerte"
                  aria-hidden
                />
                {libelles.confirmer}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-encre-douce">
                {libelles.explication}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEtape("menu")}
                  disabled={enCours}
                  autoFocus
                  className="h-10 rounded-xl border border-ligne text-[14px] font-semibold text-encre transition hover:bg-creux"
                >
                  {libelles.annuler}
                </button>
                <button
                  type="button"
                  onClick={regenerer}
                  disabled={enCours}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-alerte text-[14px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-70"
                >
                  {enCours && <Loader2 className="size-4 animate-spin" />}
                  {libelles.boutonConfirmer}
                </button>
              </div>
            </div>
          )}

          {etape === "fait" && (
            <div className="p-3">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-succes">
                <span
                  className="grid size-6 place-items-center rounded-full bg-succes text-white"
                  aria-hidden
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {libelles.regenere}
              </p>
              <Link
                href={lienImpression}
                onClick={fermer}
                className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-bouton text-[14px] font-semibold text-texte-bouton transition active:scale-[0.98]"
              >
                <Printer className="size-4" /> {libelles.imprimerNouveau}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
