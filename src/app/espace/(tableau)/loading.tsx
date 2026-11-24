// Affiché dès le toucher, pendant que la page se prépare : la navigation paraît instantanée
// (Next précharge cet écran avec chaque lien visible).
export default function Chargement() {
  return (
    <div aria-busy="true" className="mx-auto max-w-3xl animate-pulse pt-2">
      <span className="block h-56 rounded-[28px] bg-creux" />
    </div>
  );
}
