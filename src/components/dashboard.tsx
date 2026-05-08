import Link from "next/link";
import { EditorialFrame } from "./editorial-frame";
import { PaperSheet } from "./paper-sheet";
import { APP_NAME, AUTHOR_ID, getOtherAccountId } from "../lib/constants";
import { formatDisplayDate } from "../lib/format-date";
import type { DashboardData } from "../lib/types";

// DEPRECATED: Legacy dashboard. Use the feed view instead. Kept for ?view=legacy compatibility.
export function Dashboard({ data }: { data: DashboardData }) {
  const unreadCount = data.notifications.filter((notification) => !notification.readAt).length;
  const otherId = getOtherAccountId(data.user.id);
  const otherName = otherId === "leandro" ? "Leandro" : "Miranda";
  const quickLinks = [
    { href: `/${data.user.id}`, label: "Mi perfil", detail: data.user.displayName },
    { href: `/${otherId}`, label: "Perfil ajeno", detail: otherName },
    { href: `/${otherId}/write`, label: "Escribir", detail: `A ${otherName}` },
  ];

  return (
    <EditorialFrame
      eyebrow={APP_NAME}
      title={`Hola, ${data.user.displayName}`}
      description={data.user.bio}
      actions={
        <form action="/api/auth/logout" method="post">
          <button className="paper-button">salir</button>
        </form>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <section className="space-y-6">
          <PaperSheet tone="raised" className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Accesos</p>
                <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">Navegación</h2>
              </div>
              <span className="border border-[color:var(--border)] px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">
                cuenta fija
              </span>
            </div>

            <div className="mt-5 overflow-hidden border border-[color:var(--border)]">
              {quickLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-[color:var(--paper-muted)] ${index > 0 ? "ledger-divider" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium text-[color:var(--ink)]">{link.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{link.detail}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--wine)]">abrir</span>
                </Link>
              ))}
            </div>
          </PaperSheet>

          {data.user.id === AUTHOR_ID ? (
            <PaperSheet tone="accent" className="p-6 sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Nuevo borrador</p>
              <form action="/api/drafts" method="post" className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Título</span>
                  <input name="title" required className="paper-control" placeholder="Una nueva carta" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Texto</span>
                  <textarea name="body" rows={8} required className="paper-control min-h-[12rem] resize-y" placeholder="Escribí un borrador..." />
                </label>

                <button className="paper-button">guardar borrador</button>
              </form>
            </PaperSheet>
          ) : null}

          <PaperSheet tone="base" className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Borradores</p>
                <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">Tus borradores</h2>
              </div>
              <span className="border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--ink-muted)]">
                {data.drafts.length}
              </span>
            </div>

            <div className="mt-5 space-y-0 overflow-hidden border border-[color:var(--border)]">
              {data.drafts.length ? (
                data.drafts.map((letter) => (
                  <Link
                    key={letter.id}
                    href={`/letter/${letter.id}`}
                    className="group block px-4 py-4 transition hover:bg-[color:var(--paper-muted)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-medium text-[color:var(--ink)] group-hover:text-[color:var(--wine)]">{letter.title}</h3>
                        <p className="mt-1 line-clamp-3 text-sm leading-6 text-[color:var(--ink-muted)]">{letter.body}</p>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--wine)]">borrador</span>
                    </div>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">abrir carta</p>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-8 text-sm text-[color:var(--ink-muted)] ledger-divider">
                  No hay borradores todavía.
                </p>
              )}
            </div>
          </PaperSheet>

          <PaperSheet tone="base" className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Publicadas</p>
                <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">Cartas compartidas</h2>
              </div>
              <span className="border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--ink-muted)]">
                {data.published.length}
              </span>
            </div>

            <div className="mt-5 space-y-0 overflow-hidden border border-[color:var(--border)]">
              {data.published.map((letter) => (
                <Link
                  key={letter.id}
                  href={`/letter/${letter.id}`}
                  className="group block px-4 py-4 transition hover:bg-[color:var(--paper-muted)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-medium text-[color:var(--ink)] group-hover:text-[color:var(--wine)]">{letter.title}</h3>
                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-[color:var(--ink-muted)]">{letter.body}</p>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--wine)]">publicada</span>
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">abrir carta</p>
                </Link>
              ))}
            </div>
          </PaperSheet>
        </section>

        <aside className="space-y-6">
          <PaperSheet tone="accent" className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Notificaciones</p>
                <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">{unreadCount} sin leer</h2>
              </div>
              <span className="border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--ink-muted)]">
                {data.notifications.length}
              </span>
            </div>

            <div className="mt-5 space-y-0 overflow-hidden border border-[color:var(--border)]">
              {data.notifications.length ? (
                data.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-4 ${notification.readAt ? "ledger-divider" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[color:var(--ink)]">{notification.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">{notification.message}</p>
                      </div>
                      {!notification.readAt ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--wine)]" /> : null}
                    </div>
                    {!notification.readAt ? (
                      <form action={`/api/notifications/${notification.id}/read`} method="post" className="mt-3">
                        <button className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--wine)] transition hover:text-[color:var(--ink)]">
                          marcar como leída
                        </button>
                      </form>
                    ) : null}
                    <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">
                      {formatDisplayDate(notification.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="px-4 py-8 text-sm text-[color:var(--ink-muted)] ledger-divider">
                  No hay notificaciones.
                </p>
              )}
            </div>
          </PaperSheet>

          <PaperSheet tone="base" className="p-6 sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Cómo funciona</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--ink-muted)]">
              <li>• Los borradores solo los ve y edita quien los escribió.</li>
              <li>• Las cartas publicadas quedan visibles para Leandro y Miranda.</li>
              <li>• Cada cambio deja una huella completa en el historial.</li>
              <li>• La automatización vive del lado servidor y no aparece en la UI.</li>
            </ul>
          </PaperSheet>
        </aside>
      </div>
    </EditorialFrame>
  );
}
