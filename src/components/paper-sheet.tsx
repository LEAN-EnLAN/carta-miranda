import type { ReactNode } from "react";

interface PaperSheetProps {
  tone?: "base" | "raised" | "accent";
  children: ReactNode;
  className?: string;
}

const toneClasses = {
  base: "paper-sheet",
  raised: "paper-sheet paper-sheet--raised",
  accent: "paper-sheet paper-sheet--accent",
} as const;

export function PaperSheet({ tone = "base", children, className }: PaperSheetProps) {
  return (
    <section className={[toneClasses[tone], className].filter(Boolean).join(" ")}>
      {children}
    </section>
  );
}
