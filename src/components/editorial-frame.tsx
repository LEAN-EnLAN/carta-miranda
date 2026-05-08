import type { ReactNode } from "react";

interface EditorialFrameProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function EditorialFrame({ eyebrow, title, description, actions, children, className }: EditorialFrameProps) {
  return (
    <main className={["mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8", className].filter(Boolean).join(" ")}>
      {(eyebrow || title || description || actions) ? (
        <header className="flex flex-col gap-5 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? <p className="text-[11px] uppercase tracking-[0.45em] text-[color:var(--wine)]/80">{eyebrow}</p> : null}
            {title ? <h1 className="font-serif text-4xl leading-none tracking-tight text-[color:var(--ink)] sm:text-5xl">{title}</h1> : null}
            {description ? <p className="max-w-2xl text-sm leading-6 text-[color:var(--ink-muted)] sm:text-base">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
        </header>
      ) : null}

      {children}
    </main>
  );
}
