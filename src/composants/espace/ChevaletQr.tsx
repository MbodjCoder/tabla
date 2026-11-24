// Chevalet de table imprimable (A6 portrait, pleine page) : le support physique du produit.
// Palette « Signature », celle de l'espace de l'équipe : fond anthracite, filets et logo dorés,
// « Scan me », un grand QR code classique (anthracite sur blanc, lu du premier coup par tous les
// téléphones) dans son cadre doré, le numéro de table.
import QRCode from "qrcode";

type Proprietes = {
  url: string;
  numeroTable: string;
  libelleTable: string; // « Table »
  sautDePage?: boolean; // impression en série : une page par chevalet
};

const ANTHRACITE = "#1c2529";
const OR = "#d4b27a";
const MARGE_QR = 2; // zone blanche autour du code, en modules (le panneau blanc complète)

/** QR code en SVG, carrés anthracite sur blanc : le format que tous les téléphones lisent du premier coup. */
function qrSimple(url: string): string {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  const taille = modules.size;
  const cote = taille + 2 * MARGE_QR;

  let trace = "";
  for (let ligne = 0; ligne < taille; ligne++) {
    for (let colonne = 0; colonne < taille; colonne++) {
      if (modules.get(ligne, colonne))
        trace += `M${colonne + MARGE_QR} ${ligne + MARGE_QR}h1v1h-1z`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cote} ${cote}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${cote}" height="${cote}" fill="#fff"/><path fill="${ANTHRACITE}" d="${trace}"/></svg>`;
}

export function ChevaletQr({
  url,
  numeroTable,
  libelleTable,
  sautDePage = false,
}: Proprietes) {
  // SVG construit ici à partir d'une URL maîtrisée : insertion sûre
  const svg = qrSimple(url);

  return (
    <article
      className={`@container relative aspect-[105/148] w-full max-w-[400px] overflow-hidden rounded-[22px] text-center shadow-carte print:h-[148mm] print:w-[105mm] print:max-w-none print:rounded-none print:shadow-none ${
        sautDePage ? "print:break-after-page" : ""
      }`}
      style={{
        background: `radial-gradient(120% 90% at 50% 35%, #26323a 0%, ${ANTHRACITE} 58%, #141b1e 100%)`,
      }}
    >
      <Filets />

      {/* Tailles en cqw (largeur du chevalet) : la même mise en page à l'écran et sur papier */}
      <div className="relative flex h-full flex-col items-center px-[9cqw] pt-[11cqw] pb-[10cqw]">
        {/* Le logo, sans nom propre : le même que l'en-tête, en version claire */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logos/logo-restaurant-clair.svg"
          alt="Restaurant, Sénégal"
          className="w-[66cqw]"
        />

        <div className="min-h-[5cqw] flex-1" />
        <p
          className="font-serif text-[5.6cqw] leading-none tracking-[0.34em] uppercase"
          style={{ color: OR }}
        >
          Scan me
        </p>
        <div
          className="mt-[4.5cqw] w-[72cqw] rounded-[2.5cqw] border-[0.35cqw] bg-white p-[2.5cqw]"
          style={{ borderColor: OR }}
        >
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </div>

        <p
          className="mt-[5cqw] flex items-baseline gap-[2.5cqw]"
          style={{ color: OR }}
        >
          <span className="text-[4.2cqw] font-bold tracking-[0.3em] uppercase">
            {libelleTable}
          </span>
          <span className="font-serif text-[11cqw] leading-none tabular-nums text-white">
            {numeroTable}
          </span>
        </p>
      </div>
    </article>
  );
}

/** Filets dorés de la page : double cadre fin et angles en gradins, comme le chevalet de Lalla. */
function Filets() {
  return (
    <svg
      viewBox="0 0 105 148"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
      fill="none"
      stroke={OR}
      strokeWidth="0.22"
      aria-hidden
    >
      <g opacity="0.55">
        <rect x="3.5" y="3.5" width="98" height="141" />
        <path d="M5.5 14 V5.5 H14 M91 5.5 H99.5 V14 M99.5 134 V142.5 H91 M14 142.5 H5.5 V134" />
        <path d="M7.5 20 V7.5 H20 M85 7.5 H97.5 V20 M97.5 128 V140.5 H85 M20 140.5 H7.5 V128" />
      </g>
    </svg>
  );
}

/** Format d'impression : une page A6 par chevalet, pleine page, couleurs conservées. */
export function StylesImpressionChevalets() {
  return (
    <style>{`
      @page { size: 105mm 148mm; margin: 0; }
      @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `}</style>
  );
}
