import { FIXED_ACCOUNTS } from "../lib/constants";
import { PaperSheet } from "./paper-sheet";

export function LoginPanel({ error }: { error?: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <PaperSheet tone="raised" className="p-8 sm:p-10">
          <section className="space-y-6">
            <p className="text-[11px] uppercase tracking-[0.45em] text-[color:var(--wine)]/75">Carta Miranda</p>
            <h1 className="max-w-xl font-serif text-4xl leading-none tracking-tight text-[color:var(--ink)] sm:text-5xl">
              Dos cuentas fijas, una historia compartida.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-[color:var(--ink-muted)] sm:text-base">
              Un espacio privado para escribirse cartas. Borradores, versiones y el rastro de una conversación a dos voces.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {FIXED_ACCOUNTS.map((account) => (
                <article key={account.id} className="border border-[color:var(--border)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[color:var(--ink)]">{account.displayName}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">@{account.handle}</p>
                    </div>
                    <span className="h-3 w-3 rounded-full" style={{ background: account.accent }} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[color:var(--ink-muted)]">{account.bio}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--wine)]/75">elegir esta voz</p>
                </article>
              ))}
            </div>
          </section>
        </PaperSheet>

        <PaperSheet tone="base" className="p-6 sm:p-8">
          <section>
            <p className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--wine)]/75">Ingreso</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--ink-muted)]">
              Elegí con qué voz querés entrar. Cada identidad tiene sus borradores y sus cartas.
            </p>
            <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Cuenta</span>
                <select name="username" className="paper-control" defaultValue="leandro">
                  {FIXED_ACCOUNTS.map((account) => (
                    <option key={account.id} value={account.handle}>
                      {account.displayName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Contraseña</span>
                <input
                  name="password"
                  type="password"
                  required
                  className="paper-control"
                  placeholder="tu clave"
                />
              </label>

              {error ? <p className="paper-sheet px-4 py-3 text-sm text-[color:var(--wine)]">{error}</p> : null}

              <button type="submit" className="paper-button w-full">
                entrar al archivo
              </button>
            </form>
          </section>
        </PaperSheet>
      </div>
    </main>
  );
}
