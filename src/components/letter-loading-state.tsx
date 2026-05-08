export function LetterLoadingState({ label = "Preparando la carta…" }: { label?: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
      <section className="w-full max-w-md border border-[color:var(--border)] bg-[color:var(--paper-strong)] p-6 shadow-[2px_2px_0_var(--border)] sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-6">
          <div className="h-px flex-1 bg-[color:var(--border)]" />
          <p className="font-serif text-4xl leading-none text-[color:var(--wine)]">C</p>
          <div className="h-px flex-1 bg-[color:var(--border)]" />
        </div>

        <div className="space-y-4" aria-hidden="true">
          <div className="h-3 w-24 animate-pulse bg-[color:var(--paper-muted)]" />
          <div className="h-8 w-3/4 animate-pulse bg-[color:var(--paper-muted)]" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full animate-pulse bg-[color:var(--paper-muted)]" />
            <div className="h-3 w-11/12 animate-pulse bg-[color:var(--paper-muted)]" />
            <div className="h-3 w-5/6 animate-pulse bg-[color:var(--paper-muted)]" />
          </div>
        </div>

        <p className="mt-8 text-center text-sm italic text-[color:var(--ink-muted)]">{label}</p>
      </section>
    </main>
  );
}
