import Link from "next/link";
import type { FeedLetterItem } from "@/lib/types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function FeedCardStack({ item }: { item: FeedLetterItem }) {
  const recentVersions = item.letter.versions.slice().reverse().slice(0, 3);

  return (
    <article className="relative mb-12 border-l border-[color:var(--border)] pl-6 transition-colors hover:border-[color:var(--ink-muted)]">
      <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-[color:var(--border)]"></div>
      
      <div className="flex flex-col items-start gap-4 lg:flex-row lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-widest text-[color:var(--ink-muted)]">
            Hilo · {item.versionCount} versiones
          </p>
          <h3 className="mt-1 font-serif text-3xl font-normal leading-tight text-[color:var(--ink)]">
            {item.letter.title}
          </h3>
        </div>

        <Link href={`/letter/${item.letter.id}`} className="paper-button shrink-0">
          Leer hilo
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {recentVersions.map((version) => (
          <div key={version.id} className="group relative pl-4">
            <div className="absolute left-0 top-0 h-full w-[2px] bg-transparent group-hover:bg-[color:var(--wine-soft)] transition-colors"></div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--wine)]">
                {version.type}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[color:var(--ink-muted)]">
                {formatDate(version.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink)]">
              {version.summary}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
