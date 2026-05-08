"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="font-serif text-3xl text-[color:var(--ink)]">Algo salió mal</h1>
      <p className="mt-4 text-sm text-[color:var(--ink-muted)]">No pudimos cargar esta parte. Probá de nuevo.</p>
      <div className="mt-8 flex items-center gap-4">
        <button type="button" onClick={reset} className="paper-button">
          reintentar
        </button>
        <Link href="/" className="paper-button">
          volver
        </Link>
      </div>
    </main>
  );
}
