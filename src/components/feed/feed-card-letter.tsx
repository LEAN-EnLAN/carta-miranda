"use client";

import Link from "next/link";
import type { AccountId, FeedLetterItem } from "@/lib/types";
import { PaperSheet } from "../paper-sheet";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function FeedCardLetter({ item, viewerId }: { item: FeedLetterItem; viewerId?: AccountId }) {
  const authorName = item.letter.authorId === "leandro" ? "Leandro" : "Miranda";
  const isDraft = item.letter.status === "draft";
  const canDelete = isDraft && viewerId === item.letter.authorId;

  async function handleDelete() {
    if (!confirm("¿Seguro que querés borrar este borrador?")) return;
    const response = await fetch(`/api/drafts/${item.letter.id}`, { method: "DELETE" });
    if (response.ok) {
      window.location.reload();
    }
  }

  return (
    <PaperSheet tone={isDraft ? "raised" : "base"} className="feed-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">{isDraft ? "Borrador privado" : "Carta en el feed"}</p>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-[color:var(--ink)]">{item.letter.title}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[color:var(--ink-muted)]">
            {authorName} · {formatDate(item.createdAt)}
          </p>
        </div>

        <span className="border border-[color:var(--border)] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
          {isDraft ? "borrador" : "carta"}
        </span>
      </div>

      <p className="mt-5 whitespace-pre-wrap text-[0.98rem] leading-8 text-[color:var(--ink)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:leading-none first-letter:text-[color:var(--wine)]">
        {item.letter.body}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--ink-muted)]">
          {item.versionCount > 1 ? `${item.versionCount} huellas` : item.visibleToViewer ? "visible para vos" : "solo para el autor"}
        </p>
        <div className="flex items-center gap-3">
          {canDelete ? (
            <button type="button" onClick={handleDelete} className="paper-button text-[color:var(--wine)] border-[color:var(--wine)] hover:bg-[color:var(--wine)] hover:text-[color:var(--paper)]">
              borrar
            </button>
          ) : null}
          <Link href={`/letter/${item.letter.id}`} className="paper-button">
            abrir
          </Link>
        </div>
      </div>
    </PaperSheet>
  );
}
