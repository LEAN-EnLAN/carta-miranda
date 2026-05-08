export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12">
      <div className="text-center space-y-6">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[color:var(--wine)] border-t-transparent" />
        <div className="space-y-3">
          <div className="h-4 w-1/3 bg-[color:var(--paper-muted)] animate-pulse mx-auto" />
          <div className="h-8 w-2/3 bg-[color:var(--paper-muted)] animate-pulse mx-auto" />
          <div className="h-32 w-full max-w-lg bg-[color:var(--paper-muted)] animate-pulse mx-auto" />
        </div>
      </div>
    </main>
  );
}
