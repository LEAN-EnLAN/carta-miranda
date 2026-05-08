"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-8 flex items-center justify-between gap-6">
        <div className="h-px flex-1 bg-[color:var(--border)]" />
        <p className="font-serif text-4xl leading-none text-[color:var(--wine)]">C</p>
        <div className="h-px flex-1 bg-[color:var(--border)]" />
      </div>
      <h1 className="font-serif text-3xl text-[color:var(--ink)]">Algo salió mal</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--ink-muted)]">No pudimos cargar esta parte. A veces pasa — probá de nuevo o volvé al inicio.</p>
      <div className="mt-8 flex items-center gap-4">
        <button type="button" onClick={reset} className="paper-button">
          reintentar
        </button>
        <Link href="/" className="paper-button">
          volver al archivo
        </Link>
      </div>
    </main>
  );
}
