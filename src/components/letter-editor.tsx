"use client";

import { useState } from "react";
import Link from "next/link";
import type { LetterDetailData } from "../lib/types";
import { EditorialFrame } from "./editorial-frame";
import { PaperSheet } from "./paper-sheet";
import { LetterHistory } from "./letter-history";

export function LetterEditor({ data }: { data: LetterDetailData }) {
  const latestVersion = data.letter.versions[data.letter.versions.length - 1];
  const [title, setTitle] = useState(data.letter.title);
  const [body, setBody] = useState(data.letter.body);
  const [spotifyTrack, setSpotifyTrack] = useState(data.letter.spotifyTrack ?? latestVersion.spotifyTrack ?? "");
  const [accent, setAccent] = useState(data.letter.accent ?? latestVersion.accent ?? "#f472b6");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  async function handleSave() {
    setSaving(true);
    const response = await fetch(`/api/drafts/${data.letter.id}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, spotifyTrack: spotifyTrack || undefined, accent }),
    });
    setSaving(false);
    if (response.ok) setSaved(true);
  }

  async function handlePublish() {
    const confirmed = window.confirm(
      "¿Publicar esta carta? Una vez publicada, no se puede deshacer."
    );
    if (!confirmed) return;
    setSaving(true);
    await fetch(`/api/drafts/${data.letter.id}/publish`, { method: "POST" });
    window.location.reload();
  }

  return (
    <EditorialFrame
      eyebrow={data.letter.status === "draft" ? "Borrador" : "Carta publicada"}
      title={data.letter.title}
      description={
        data.letter.status === "draft"
          ? data.isAuthor
            ? "Editá, ajustá y cuando esté lista publicala. Solo vos la ves hasta entonces."
            : "Borrador en proceso. Solo el autor puede editarlo."
          : "Versión final, impresa sobre papel para archivo."
      }
      actions={
        <Link href="/" className="paper-button">
          volver
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_18rem]">
        <PaperSheet tone="raised" className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Manuscrito</p>
              <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">
                {data.isAuthor ? "Editá esta carta" : "Lectura"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ink-muted)]">
                {data.isAuthor ? "Cambiar el texto crea una nueva versión. El historial queda intacto." : "Solo lectura para cartas publicadas."}
              </p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">última versión: {latestVersion.type}</p>
          </div>

          {data.isAuthor ? (
            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Titulo</span>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setSaved(false);
                  }}
                  className="paper-control"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Spotify</span>
                  <input
                    value={spotifyTrack}
                    onChange={(event) => {
                      setSpotifyTrack(event.target.value);
                      setSaved(false);
                    }}
                    className="paper-control"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Color de acento</span>
                  <input
                    type="color"
                    value={accent}
                    onChange={(event) => {
                      setAccent(event.target.value);
                      setSaved(false);
                    }}
                    className="paper-control h-12 p-2"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs text-[color:var(--ink-muted)]">
                <span>{wordCount} palabras</span>
                <button type="button" onClick={() => setShowPreview((value) => !value)} className="underline underline-offset-2">
                  {showPreview ? "ocultar preview" : "mostrar preview"}
                </button>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-[color:var(--ink-muted)]">Contenido</span>
                <textarea
                  rows={16}
                  value={body}
                  onChange={(event) => {
                    setBody(event.target.value);
                    setSaved(false);
                  }}
                  className="paper-control min-h-[24rem] resize-y"
                  style={{ borderColor: `${accent}55` }}
                />
              </label>

              {showPreview ? (
                <PaperSheet tone="base" className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                    Preview
                  </p>
                  <h3 className="mt-3 font-serif text-2xl text-[color:var(--ink)]">{title || "Sin título"}</h3>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[color:var(--ink)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:leading-none first-letter:text-[color:var(--wine)]">
                    {body || "Todavía no escribiste nada."}
                  </p>
                  {spotifyTrack ? <p className="mt-4 text-xs text-[color:var(--ink-muted)]">Spotify: {spotifyTrack}</p> : null}
                </PaperSheet>
              ) : null}

              {!saved ? <p className="text-xs text-[color:var(--wine)]">Tenés cambios sin guardar.</p> : null}

              <div className="flex flex-wrap gap-3">
                <button onClick={handleSave} disabled={saving || !title.trim() || !body.trim()} className="paper-button disabled:opacity-50">
                  {saving ? "guardando..." : saved ? "guardado" : "guardar"}
                </button>
                {data.letter.status === "draft" ? (
                  <button onClick={handlePublish} disabled={saving} className="paper-button disabled:opacity-50">
                    publicar
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <article className="mt-6 space-y-4">
              <p className="text-justify whitespace-pre-line text-sm leading-8 text-[color:var(--ink)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:leading-none first-letter:text-[color:var(--wine)]">
                {data.letter.body}
              </p>
              {spotifyTrack ? <p className="text-xs text-[color:var(--ink-muted)]">Spotify: {spotifyTrack}</p> : null}
            </article>
          )}
        </PaperSheet>

        <aside className="space-y-6">
          <PaperSheet tone="base" className="p-6 sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Detalle</p>
            <dl className="mt-5 space-y-3 text-sm text-[color:var(--ink-muted)]">
              <div className="flex justify-between gap-4 ledger-divider pt-3 first:border-0 first:pt-0">
                <dt>Autor</dt>
                <dd className="text-[color:var(--ink)]">{data.user.displayName}</dd>
              </div>
              <div className="flex justify-between gap-4 ledger-divider pt-3">
                <dt>Estado</dt>
                <dd className="text-[color:var(--ink)]">{data.letter.status === "draft" ? "Borrador" : "Publicada"}</dd>
              </div>
              <div className="flex justify-between gap-4 ledger-divider pt-3">
                <dt>Para</dt>
                <dd className="text-[color:var(--ink)]">{data.recipients.map((recipient) => recipient.displayName).join(", ")}</dd>
              </div>
            </dl>
          </PaperSheet>
          <LetterHistory versions={data.letter.versions} />
        </aside>
      </div>
    </EditorialFrame>
  );
}
