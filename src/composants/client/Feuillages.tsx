// Rameaux de feuilles très pâles dans les coins du haut : le décor chaleureux de la carte,
// purement décoratif (aucune interaction, ignoré des lecteurs d'écran).

// Une feuille couchée, la pointe à droite (28 × 12), posée et tournée le long de la tige
const FEUILLE = "M0 0C7-7 20-7 28 0C20 7 7 7 0 0Z";

function Rameau({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 140 150"
      aria-hidden
      className={`pointer-events-none absolute text-accent ${className}`}
    >
      <g fill="currentColor">
        <path
          d="M8 146C30 110 52 72 96 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {[
          [22, 124, -95],
          [24, 122, -20],
          [38, 100, -100],
          [41, 98, -25],
          [55, 78, -105],
          [59, 76, -30],
          [73, 56, -110],
          [78, 53, -35],
          [92, 27, -55],
        ].map(([x, y, angle]) => (
          <path
            key={`${x}-${y}`}
            d={FEUILLE}
            transform={`translate(${x} ${y}) rotate(${angle}) scale(1.35)`}
          />
        ))}
      </g>
    </svg>
  );
}

export function Feuillages() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden opacity-[0.16]"
    >
      <Rameau className="-start-8 -top-6 h-40 w-36 -rotate-[30deg] rtl:-scale-x-100" />
      <Rameau className="-end-6 -top-4 h-44 w-40 rotate-[60deg] -scale-x-100 rtl:scale-x-100" />
    </div>
  );
}
