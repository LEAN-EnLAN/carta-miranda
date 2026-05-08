export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12">
      <div className="text-center space-y-4">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[color:var(--wine)] border-t-transparent" />
        <p className="text-sm text-[color:var(--ink-muted)]">Cargando carta…</p>
      </div>
    </main>
  );
}
