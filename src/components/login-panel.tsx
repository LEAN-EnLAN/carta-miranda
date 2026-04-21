import { FIXED_ACCOUNTS } from "../lib/constants";

export function LoginPanel({ error }: { error?: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.45em] text-rose-200/70">Carta Miranda</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-rose-50 sm:text-5xl">
            Dos cuentas fijas, una historia compartida.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-rose-100/75 sm:text-base">
            Entrá con una de las dos identidades del sistema para escribir, leer o seguir el rastro de cada versión.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {FIXED_ACCOUNTS.map((account) => (
              <div key={account.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-rose-50">{account.displayName}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-rose-200/55">@{account.handle}</p>
                  </div>
                  <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${account.accent}`} />
                </div>
                <p className="mt-3 text-xs leading-5 text-rose-100/65">{account.bio}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-rose-100/40">acceso fijo</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-rose-200/10 bg-black/25 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-rose-100/50">Ingreso</p>
          <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-rose-100/80">Cuenta</span>
              <select
                name="username"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40"
                defaultValue="leandro"
              >
                {FIXED_ACCOUNTS.map((account) => (
                  <option key={account.id} value={account.handle} className="bg-zinc-950">
                    {account.displayName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-rose-100/80">Contraseña</span>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-rose-50 outline-none transition placeholder:text-rose-100/25 focus:border-rose-300/40"
                placeholder="tu clave"
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-rose-400 via-fuchsia-300 to-amber-200 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-950 transition hover:brightness-110"
            >
              entrar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
