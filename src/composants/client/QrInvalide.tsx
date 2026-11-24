// QR code inconnu, désactivé ou régénéré : un message clair, dans les langues courantes.
import { QrCode } from "lucide-react";
import { traducteurClient } from "@/lib/i18n/client";

export function QrInvalide() {
  const fr = traducteurClient("fr");
  const en = traducteurClient("en");
  return (
    <main className="grid min-h-dvh place-items-center bg-fond px-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-creux text-encre-douce">
          <QrCode className="size-7" />
        </span>
        <h1 className="mt-5 font-serif text-[28px] leading-tight text-encre">
          {fr("qrInvalideTitre")}
        </h1>
        <p className="mt-2 text-[15px] text-encre-douce">
          {fr("qrInvalideTexte")}
        </p>
        <p lang="en" className="mt-6 text-[13.5px] text-encre-pale">
          {en("qrInvalideTitre")}. {en("qrInvalideTexte")}
        </p>
      </div>
    </main>
  );
}
