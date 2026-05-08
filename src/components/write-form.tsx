"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { AccountId, ComposerDraft } from "@/lib/types";
import { PaperSheet } from "./paper-sheet";

export interface ComposerValues {
  title: string;
  body: string;
  spotifyTrack: string;
  accent: string;
  recipientId: AccountId;
}

export const DEFAULT_COMPOSER_ACCENT = "#f472b6";

export function countComposerWords(body: string) {
  return body.trim() ? body.trim().split(/\s+/).length : 0;
}

export function isComposerReady(values: Pick<ComposerValues, "title" | "body">) {
  return Boolean(values.title.trim() && values.body.trim());
}

export function ComposerPreview({ draft, emptyMessage = "Todavía no escribiste nada." }: { draft: Pick<ComposerValues, "title" | "body" | "spotifyTrack" | "accent">; emptyMessage?: string }) {
  return (
    <PaperSheet tone="base" className="p-5">
      <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: draft.accent }}>
        Preview
      </p>
      <h2 className="mt-3 font-serif text-2xl text-[color:var(--ink)]">{draft.title || "Sin título"}</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[color:var(--ink)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:leading-none first-letter:text-[color:var(--wine)]">
        {draft.body || emptyMessage}
      </p>
      {draft.spotifyTrack ? <p className="mt-4 text-xs text-[color:var(--ink-muted)]">Spotify: {draft.spotifyTrack}</p> : null}
    </PaperSheet>
  );
}

export function ComposerFields({
  values,
  onChange,
  onTogglePreview,
  showPreview,
  disabled = false,
}: {
  values: ComposerValues;
  onChange: (patch: Partial<ComposerValues>) => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
  disabled?: boolean;
}) {
  const deferredBody = useDeferredValue(values.body);
  const wordCount = useMemo(() => countComposerWords(deferredBody), [deferredBody]);

  return (
    <>
      <label className="block">
        <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Titulo</span>
        <input
          value={values.title}
          disabled={disabled}
          onChange={(event) => onChange({ title: event.target.value })}
          className="paper-control"
          placeholder="Cómo querés llamarla"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Spotify</span>
          <input
            value={values.spotifyTrack}
            disabled={disabled}
            onChange={(event) => onChange({ spotifyTrack: event.target.value })}
            className="paper-control"
            placeholder="https://open.spotify.com/..."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Color de acento</span>
          <input
            type="color"
            value={values.accent}
            disabled={disabled}
            onChange={(event) => onChange({ accent: event.target.value })}
            className="paper-control h-12 p-2"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 text-xs text-[color:var(--ink-muted)]">
        <span>{wordCount} palabras</span>
        {onTogglePreview ? (
          <button type="button" onClick={onTogglePreview} className="underline underline-offset-2">
            {showPreview ? "ocultar preview" : "mostrar preview"}
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Contenido</span>
        <textarea
          rows={16}
          value={values.body}
          disabled={disabled}
          onChange={(event) => onChange({ body: event.target.value })}
          className="paper-control min-h-[14rem] resize-y sm:min-h-[18rem] lg:min-h-[22rem]"
          style={{ borderColor: "var(--wine-soft)" }}
          placeholder="Escribile algo lindo..."
        />
      </label>
    </>
  );
}

export function toComposerDraft(values: ComposerValues): ComposerDraft {
  return {
    recipientId: values.recipientId,
    title: values.title.trim(),
    body: values.body.trim(),
    spotifyTrack: values.spotifyTrack.trim() || undefined,
    accent: values.accent,
    updatedAt: new Date().toISOString(),
  };
}

export function WriteForm({ recipientId }: { recipientId: AccountId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [spotifyTrack, setSpotifyTrack] = useState("");
  const [accent, setAccent] = useState(DEFAULT_COMPOSER_ACCENT);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const values = { title, body, spotifyTrack, accent, recipientId };

  async function handleSubmit() {
    if (!isComposerReady(values)) return;
    setSaving(true);
    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body: body.trim(),
        spotifyTrack: spotifyTrack.trim() || undefined,
        accent,
        recipientId,
      }),
    });
    setSaving(false);
    if (response.ok) {
      setSaved(true);
      window.location.href = "/";
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_18rem]">
        <PaperSheet tone="raised" className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--wine)]/75">Escribir carta</p>
              <h1 className="mt-2 font-serif text-4xl leading-none tracking-tight text-[color:var(--ink)]">Para {recipientId === "miranda" ? "Miranda" : "Leandro"}</h1>
            </div>
            <Link href="/" className="paper-button">
              volver
            </Link>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleSubmit();
            }}
          >
            <ComposerFields
              values={values}
              showPreview={showPreview}
              onTogglePreview={() => setShowPreview((current) => !current)}
              onChange={(patch) => {
                if (patch.title !== undefined) {
                  setTitle(patch.title);
                  setSaved(false);
                }
                if (patch.body !== undefined) {
                  setBody(patch.body);
                  setSaved(false);
                }
                if (patch.spotifyTrack !== undefined) {
                  setSpotifyTrack(patch.spotifyTrack);
                  setSaved(false);
                }
                if (patch.accent !== undefined) {
                  setAccent(patch.accent);
                  setSaved(false);
                }
              }}
            />

            {showPreview ? <ComposerPreview draft={values} /> : null}

            {(title || body || spotifyTrack) && !saved ? <p className="text-sm text-[color:var(--wine)]">Tenés cambios sin guardar.</p> : null}

            <button type="submit" disabled={saving || !isComposerReady(values)} className="paper-button w-full disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "guardando..." : saved ? "guardado" : "guardar borrador"}
            </button>
          </form>
        </PaperSheet>

        <aside className="space-y-6">
          <PaperSheet tone="base" className="p-6 sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Nota</p>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-muted)]">
              Esta carta queda como borrador hasta que la publiques. El acento acompaña la identidad del manuscrito.
            </p>
          </PaperSheet>
        </aside>
      </div>
    </main>
  );
}
