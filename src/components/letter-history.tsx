import type { LetterVersion } from "../lib/types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function LetterHistory({ versions }: { versions: LetterVersion[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Historial visible</p>
      <div className="mt-5 space-y-4">
        {versions.slice().reverse().map((version) => (
          <article key={version.id} className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-rose-50">{version.summary}</p>
              <span className="text-[11px] uppercase tracking-[0.25em] text-rose-100/40">{version.type}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-rose-100/65 line-clamp-4 whitespace-pre-line">{version.body}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-rose-100/35">{formatDate(version.createdAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
