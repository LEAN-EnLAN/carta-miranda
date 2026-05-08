import Link from "next/link";
import { PaperSheet } from "./paper-sheet";
import { getOtherAccountId } from "@/lib/constants";
import type { DashboardData } from "@/lib/types";

export function HomeSidebar({ data }: { data: DashboardData }) {
  const otherId = getOtherAccountId(data.user.id);
  const otherName = otherId === "leandro" ? "Leandro" : "Miranda";
  const unreadCount = data.notifications.filter((n) => !n.readAt).length;

  return (
    <aside className="space-y-6">
      {/* Profile card */}
      <PaperSheet className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[color:var(--wine)] text-sm font-medium uppercase tracking-wider text-white">
            {data.user.displayName[0]}
          </div>
          <div>
            <p className="font-serif text-lg font-medium text-[color:var(--ink)]">{data.user.displayName}</p>
            <p className="text-xs text-[color:var(--ink-muted)]">{data.user.bio}</p>
          </div>
        </div>
      </PaperSheet>

      {/* Stats card */}
      <PaperSheet className="space-y-3 p-5">
        <h3 className="text-[10px] uppercase tracking-widest text-[color:var(--ink-muted)]">El archivo</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[color:var(--ink-muted)]">Cartas compartidas</span>
            <span className="font-medium text-[color:var(--ink)]">{data.published.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[color:var(--ink-muted)]">Borradores tuyos</span>
            <span className="font-medium text-[color:var(--ink)]">{data.drafts.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[color:var(--ink-muted)]">Sin leer</span>
            <span className="font-medium text-[color:var(--wine)]">{unreadCount}</span>
          </div>
        </div>
      </PaperSheet>

      {/* Notifications card */}
      <PaperSheet className="space-y-3 p-5">
        <h3 className="text-[10px] uppercase tracking-widest text-[color:var(--ink-muted)]">Avisos</h3>
        {data.notifications.length === 0 && (
          <p className="text-sm text-[color:var(--ink-muted)]">Sin novedades.</p>
        )}
        {data.notifications.slice(0, 3).map((n) => (
          <div key={n.id} className="border-t border-[color:var(--border)] pt-2">
            <p className="text-sm text-[color:var(--ink)]">{n.title}</p>
            {!n.readAt && (
              <form action={`/api/notifications/${n.id}/read`} method="post" className="mt-1">
                <button className="min-h-[44px] text-[10px] uppercase tracking-wider text-[color:var(--wine)]">
                  marcar leída
                </button>
              </form>
            )}
          </div>
        ))}
      </PaperSheet>

      {/* Quick action */}
      <Link
        href={`/${otherId}/write`}
        className="paper-button w-full justify-center"
      >
        Escribir a {otherName}
      </Link>
    </aside>
  );
}
