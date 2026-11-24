/** Nombre de notifications en pastille ronde, chiffre bien lisible (couleur réglable dans Design) ; rien quand il n'y a rien. */
export function Pastille({
  nombre,
  className = "",
}: {
  nombre: number;
  className?: string;
}) {
  if (nombre <= 0) return null;
  return (
    <span
      className={`grid h-7 min-w-7 place-items-center rounded-full border-2 bg-pastilles px-1.5 font-sans text-[14px] leading-none font-bold text-texte-pastilles tabular-nums ${className}`}
    >
      {nombre}
    </span>
  );
}
