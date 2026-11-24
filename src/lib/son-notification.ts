// Sons de l'application, synthétisés à la volée (aucun fichier audio).
// Client : à chaque changement d'état d'une commande, le « ding » discret d'une sonnette de comptoir.

// Sonnette de réception : une note claire (Sol6) et ses partiels de cloche, non harmoniques,
// qui s'éteignent plus vite que la fondamentale : [rapport de fréquence, volume, durée en s]
const FREQUENCE_SONNETTE_HZ = 1568;
const PARTIELS_SONNETTE: [number, number, number][] = [
  [1, 0.2, 1.6],
  [2.76, 0.07, 0.9],
  [5.4, 0.03, 0.45],
];
// Si le navigateur n'a pas autorisé le son dans ce délai, on y renonce (pas de carillon en retard)
const DELAI_AUTORISATION_MS = 150;

type FenetreAudio = Window & { webkitAudioContext?: typeof AudioContext };
type NavigateurAudio = Navigator & { audioSession?: { type: string } };

let contexte: AudioContext | null = null;

function obtenirContexte(): AudioContext | null {
  if (contexte) return contexte;
  const Constructeur =
    window.AudioContext ?? (window as FenetreAudio).webkitAudioContext;
  if (!Constructeur) return null;
  // iPhone : respecter le mode silencieux, comme une notification
  const session = (navigator as NavigateurAudio).audioSession;
  if (session) session.type = "ambient";
  contexte = new Constructeur();
  return contexte;
}

/**
 * Les navigateurs n'autorisent le son qu'après un geste du client :
 * à appeler sur le premier toucher pour que les carillons suivants soient audibles.
 */
export function deverrouillerSon(): Promise<boolean> {
  const audio = obtenirContexte();
  if (!audio) return Promise.resolve(false);
  if (audio.state === "running") return Promise.resolve(true);
  return audio
    .resume()
    .then(() => audio.state === "running")
    .catch(() => false);
}

/** Le son est-il autorisé par le navigateur (un geste a déjà eu lieu) ? */
export function sonAutorise(): boolean {
  return contexte?.state === "running";
}

/** Joue le carillon si le navigateur l'autorise ; sinon, reste silencieux. */
export function jouerNotification() {
  jouerSiAutorise(jouerNotes);
}

/**
 * Alerte de l'équipe (nouvelle demande, avis à traiter) : deux notes brèves et franches,
 * audibles dans le bruit d'une réception, distinctes du carillon des clients.
 */
export function jouerAlerte() {
  jouerSiAutorise((audio) => {
    const debut = audio.currentTime + 0.02;
    [1318.5, 1760].forEach((frequence, rang) => {
      noteSimple(audio, frequence, debut + rang * 0.14, 0.26, 0.32);
      noteSimple(audio, frequence * 2, debut + rang * 0.14, 0.04, 0.12);
    });
  });
}

function jouerSiAutorise(jouer: (audio: AudioContext) => void) {
  const audio = obtenirContexte();
  if (!audio) return;
  if (audio.state === "running") return jouer(audio);

  void audio.resume().catch(() => {});
  setTimeout(
    () => audio.state === "running" && jouer(audio),
    DELAI_AUTORISATION_MS,
  );
}

function jouerNotes(audio: AudioContext) {
  const debut = audio.currentTime + 0.02;
  PARTIELS_SONNETTE.forEach(([rapport, volume, duree]) =>
    noteSimple(audio, FREQUENCE_SONNETTE_HZ * rapport, debut, volume, duree),
  );
}

function noteSimple(
  audio: AudioContext,
  frequence: number,
  instant: number,
  volume: number,
  duree: number,
) {
  const oscillateur = audio.createOscillator();
  const enveloppe = audio.createGain();
  oscillateur.type = "sine";
  oscillateur.frequency.value = frequence;
  enveloppe.gain.setValueAtTime(0.0001, instant);
  enveloppe.gain.exponentialRampToValueAtTime(volume, instant + 0.006);
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, instant + duree);
  oscillateur.connect(enveloppe).connect(audio.destination);
  oscillateur.start(instant);
  oscillateur.stop(instant + duree + 0.05);
}
