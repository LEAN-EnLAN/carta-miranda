"use client";

import { useState } from "react";
import Link from "next/link";
import type { LetterDetailData } from "../lib/types";
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
    const response = await fetch(`/api/letters/${data.letter.id}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, spotifyTrack: spotifyTrack || undefined, accent }),
    });
    setSaving(false);
    if (response.ok) setSaved(true);
  }

  async function handlePublish() {
    setSaving(true);
    await fetch(`/api/letters/${data.letter.id}/publish`, { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">{data.letter.status}</p>
            <h1 className="mt-2 text-3xl font-semibold text-rose-50">{data.letter.title}</h1>
            <p className="mt-2 text-sm text-rose-100/65">
              {data.isAuthor ? "Podes editar este texto." : "Solo lectura para cartas publicadas."}
            </p>
          </div>
          <Link href="/" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-rose-50 transition hover:bg-white/10">
            volver
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Texto actual</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-rose-100/35">ultima version: {latestVersion.type}</p>
            </div>

            {data.isAuthor ? (
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-rose-100/80">Titulo</span>
                  <input value={title} onChange={(event) => { setTitle(event.target.value); setSaved(false); }} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40" />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-rose-100/80">Spotify</span>
                    <input value={spotifyTrack} onChange={(event) => { setSpotifyTrack(event.target.value); setSaved(false); }} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-rose-100/80">Color de acento</span>
                    <input type="color" value={accent} onChange={(event) => { setAccent(event.target.value); setSaved(false); }} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 p-2" />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-4 text-xs text-rose-100/50">
                  <span>{wordCount} palabras</span>
                  <button type="button" onClick={() => setShowPreview((value) => !value)} className="underline underline-offset-2">
                    {showPreview ? "ocultar preview" : "mostrar preview"}
                  </button>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-rose-100/80">Contenido</span>
                  <textarea rows={16} value={body} onChange={(event) => { setBody(event.target.value); setSaved(false); }} className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40" style={{ borderColor: `${accent}55` }} />
                </label>

                {showPreview ? (
                  <div className="rounded-[1.5rem] border bg-white/[0.03] p-4" style={{ borderColor: `${accent}55` }}>
                    <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>Preview</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-rose-100/80">{body}</p>
                    {spotifyTrack ? <p className="mt-4 text-xs text-rose-100/55">Spotify: {spotifyTrack}</p> : null}
                  </div>
                ) : null}

                {!saved ? <p className="text-xs text-amber-100/80">Tenes cambios sin guardar.</p> : null}

                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSave} disabled={saving || !title.trim() || !body.trim()} className="rounded-2xl bg-gradient-to-r from-rose-400 via-fuchsia-300 to-amber-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-950 transition hover:brightness-110 disabled:opacity-50">
                    {saving ? "guardando..." : saved ? "guardado" : "guardar"}
                  </button>
                  {data.letter.status === "draft" ? (
                    <button onClick={handlePublish} disabled={saving} className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-rose-50 transition hover:bg-white/10 disabled:opacity-50">
                      publicar
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="whitespace-pre-line text-sm leading-7 text-rose-100/80">{data.letter.body}</p>
                {spotifyTrack ? <p className="mt-4 text-xs text-rose-100/55">Spotify: {spotifyTrack}</p> : null}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Metadatos</p>
              <dl className="mt-5 space-y-3 text-sm text-rose-100/72">
                <div className="flex justify-between gap-4">
                  <dt className="text-rose-100/45">Autor</dt>
                  <dd>{data.user.displayName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-rose-100/45">Estado</dt>
                  <dd>{data.letter.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-rose-100/45">Destinatarios</dt>
                  <dd>{data.recipients.map((recipient) => recipient.displayName).join(", ")}</dd>
                </div>
              </dl>
            </section>
            <LetterHistory versions={data.letter.versions} />
          </aside>
        </div>
      </div>
    </div>
  );
}
