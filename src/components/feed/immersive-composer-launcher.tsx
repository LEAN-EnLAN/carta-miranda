"use client";

import { useImmersiveComposer } from "./immersive-composer-provider";

export function ImmersiveComposerLauncher({ className = "" }: { className?: string }) {
  const composer = useImmersiveComposer();

  return (
    <button
      type="button"
      onClick={composer.open}
      className={[
        "paper-button",
        "md:fixed md:bottom-6 md:right-6 md:z-40 md:px-5 md:py-4",
        className,
      ].join(" ")}
    >
      escribir en vivo
    </button>
  );
}
