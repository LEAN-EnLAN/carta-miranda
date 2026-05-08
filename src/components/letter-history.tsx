import type { LetterVersion } from "../lib/types";
import { PaperSheet } from "./paper-sheet";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function LetterHistory({ versions }: { versions: LetterVersion[] }) {
  return (
    <PaperSheet tone="base" className="p-6 sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Historial visible</p>
      <div className="mt-5 space-y-0 overflow-hidden border border-[color:var(--border)]">
        {versions.slice().reverse().map((version, index) => (
          <article key={version.id} className={`px-4 py-4 ${index > 0 ? "ledger-divider" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-[color:var(--ink)]">{version.summary}</p>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--wine)]">{version.type}</span>
            </div>
            <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-[color:var(--ink-muted)]">{version.body}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">{formatDate(version.createdAt)}</p>
          </article>
        ))}
      </div>
    </PaperSheet>
  );
}
