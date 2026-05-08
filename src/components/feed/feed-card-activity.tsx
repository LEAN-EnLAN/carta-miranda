"use client";

import Link from "next/link";
import { formatDisplayDate } from "@/lib/format-date";
import type { FeedActivityItem } from "@/lib/types";

export function FeedCardActivity({ item }: { item: FeedActivityItem }) {
  const isUnread = !item.notification.readAt;

  async function markAsRead() {
    await fetch(`/api/notifications/${item.notification.id}/read`, { method: "POST" });
    window.location.reload();
  }

  return (
    <article className="relative mb-12 border-l border-[color:var(--border)] pl-6 transition-colors hover:border-[color:var(--ink-muted)]">
      <div className="absolute -left-[3px] top-2 h-1 w-1 rounded-full bg-[color:var(--ink-muted)]"></div>
      
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest text-[color:var(--ink-muted)]">
          {formatDisplayDate(item.createdAt)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--ink)]">
          Actividad
        </span>
        {isUnread ? <span className="h-1.5 w-1.5 bg-[color:var(--wine)]" /> : null}
      </div>

      <h3 className="mt-2 font-serif text-xl font-normal leading-snug text-[color:var(--ink)]">
        {item.notification.title}
      </h3>

      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--ink-muted)]">
        {item.notification.message}
      </p>

      <div className="mt-4 flex items-center gap-4">
        {item.notification.letterId && (
          <Link href={`/letter/${item.notification.letterId}`} className="text-xs font-medium uppercase tracking-wider text-[color:var(--wine)] hover:text-[color:var(--ink)]">
            Ir a la carta →
          </Link>
        )}
        {isUnread ? (
          <button type="button" onClick={markAsRead} className="text-xs font-medium uppercase tracking-wider text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
            marcar como leída
          </button>
        ) : null}
      </div>
    </article>
  );
}
