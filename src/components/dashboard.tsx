import Link from "next/link";
import { APP_NAME, AUTHOR_ID, getOtherAccountId } from "../lib/constants";
import type { DashboardData } from "../lib/types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function Dashboard({ data }: { data: DashboardData }) {
  const unreadCount = data.notifications.filter((notification) => !notification.readAt).length;
  const otherId = getOtherAccountId(data.user.id);
  const otherName = otherId === "leandro" ? "Leandro" : "Miranda";

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-rose-200/55">{APP_NAME}</p>
          <h1 className="mt-2 text-3xl font-semibold text-rose-50">Hola, {data.user.displayName}</h1>
          <p className="mt-1 text-sm text-rose-100/65">{data.user.bio}</p>
        </div>

        <form action="/api/auth/logout" method="post">
          <button className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-rose-50 transition hover:bg-white/10">
            salir
          </button>
        </form>
      </header>

      <main className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Link href={`/${data.user.id}`} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 transition hover:bg-white/[0.06]">
              <p className="text-xs uppercase tracking-[0.35em] text-rose-200/55">Mi perfil</p>
              <h2 className="mt-3 text-xl font-semibold text-rose-50">{data.user.displayName}</h2>
            </Link>
            <Link href={`/${otherId}`} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 transition hover:bg-white/[0.06]">
              <p className="text-xs uppercase tracking-[0.35em] text-rose-200/55">Perfil de</p>
              <h2 className="mt-3 text-xl font-semibold text-rose-50">{otherName}</h2>
            </Link>
            <Link href={`/${otherId}/write`} className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-rose-400/15 to-amber-200/10 p-5 transition hover:brightness-110">
              <p className="text-xs uppercase tracking-[0.35em] text-rose-200/55">Escribir carta</p>
              <h2 className="mt-3 text-xl font-semibold text-rose-50">A {otherName}</h2>
            </Link>
          </div>

          {data.user.id === AUTHOR_ID ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Nuevo borrador</p>
              <form action="/api/letters" method="post" className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-rose-100/80">Título</span>
                  <input
                    name="title"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40"
                    placeholder="Una nueva carta"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-rose-100/80">Texto</span>
                  <textarea
                    name="body"
                    rows={8}
                    required
                    className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40"
                    placeholder="Escribí un borrador..."
                  />
                </label>

                <button className="rounded-2xl bg-gradient-to-r from-rose-400 via-fuchsia-300 to-amber-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-950 transition hover:brightness-110">
                  guardar borrador
                </button>
              </form>
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Borradores</p>
                <h2 className="mt-2 text-xl font-semibold text-rose-50">Solo visibles para el autor</h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-rose-100/65">
                {data.drafts.length}
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {data.drafts.length ? (
                data.drafts.map((letter) => (
                  <Link
                    key={letter.id}
                    href={`/letters/${letter.id}`}
                    className="group rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition hover:border-rose-300/30 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-medium text-rose-50 group-hover:text-white">{letter.title}</h3>
                      <span className="text-xs uppercase tracking-[0.28em] text-rose-100/45">borrador</span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-rose-100/65">{letter.body}</p>
                  </Link>
                ))
              ) : (
                <p className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-8 text-sm text-rose-100/55">
                  No hay borradores todavía.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Publicadas</p>
                <h2 className="mt-2 text-xl font-semibold text-rose-50">Visibles para ambas cuentas</h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-rose-100/65">
                {data.published.length}
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {data.published.map((letter) => (
                <Link
                  key={letter.id}
                  href={`/letters/${letter.id}`}
                  className="group rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition hover:border-rose-300/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-rose-50 group-hover:text-white">{letter.title}</h3>
                    <span className="text-xs uppercase tracking-[0.28em] text-rose-100/45">publicada</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-rose-100/65">{letter.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Notificaciones</p>
                <h2 className="mt-2 text-xl font-semibold text-rose-50">{unreadCount} sin leer</h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-rose-100/65">
                {data.notifications.length}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {data.notifications.length ? (
                data.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-[1.25rem] border p-4 ${
                      notification.readAt ? "border-white/10 bg-black/15" : "border-rose-300/20 bg-rose-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-rose-50">{notification.title}</p>
                        <p className="mt-1 text-sm leading-6 text-rose-100/65">{notification.message}</p>
                      </div>
                      {!notification.readAt ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-300" /> : null}
                    </div>
                    {!notification.readAt ? (
                      <form action={`/api/notifications/${notification.id}/read`} method="post" className="mt-3">
                        <button className="text-[11px] uppercase tracking-[0.25em] text-rose-100/45 transition hover:text-rose-50">
                          marcar como leída
                        </button>
                      </form>
                    ) : null}
                    <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-rose-100/35">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-8 text-sm text-rose-100/55">
                  No hay notificaciones.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Reglas</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-rose-100/70">
              <li>• Los borradores solo los ve y edita quien los escribió.</li>
              <li>• Las cartas publicadas quedan visibles para Leandro y Miranda.</li>
              <li>• Cada cambio deja una huella completa en el historial.</li>
              <li>• La automatización vive del lado servidor y no aparece en la UI.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
