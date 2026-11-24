"use client";

import type { LucideIcon } from "lucide-react";
import { useState } from "react";

type Proprietes = {
  photo: string | null;
  icone: LucideIcon; // repère affiché sans photo, ou si elle ne charge pas
  className?: string;
};

// Photo d'un article ; sans photo, un aplat discret aux couleurs de l'établissement.
export function Vignette({ photo, icone: Icone, className = "" }: Proprietes) {
  const [echec, setEchec] = useState(false);

  if (!photo || echec) {
    return (
      <span
        aria-hidden
        className={`grid place-items-center bg-accent-pale text-accent ${className}`}
      >
        <Icone className="size-[38%] max-w-10" strokeWidth={1.4} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- photo locale ou lien libre fourni par l'établissement
    <img
      src={photo}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setEchec(true)}
      className={`bg-creux object-cover ${className}`}
    />
  );
}
