"use client";

import { useState } from "react";
import Link from "next/link";
import type { AccountId } from "@/lib/types";

export function WriteForm({ recipientId }: { recipientId: AccountId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [spotifyTrack, setSpotifyTrack] = useState("");
  const [accent, setAccent] = useState("#f472b6");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) return;
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
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Escribir carta</p>
            <h1 className="mt-2 text-3xl font-semibold text-rose-50">
              Para {recipientId === "miranda" ? "Miranda" : "Leandro"}
            </h1>
          </div>
          <Link href="/" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-rose-50 transition hover:bg-white/10">
            volver
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-rose-100/80">Titulo</span>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSaved(false);
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40"
              placeholder="Como queres llamarla"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-rose-100/80">Spotify</span>
              <input
                value={spotifyTrack}
                onChange={(event) => {
                  setSpotifyTrack(event.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40"
                placeholder="https://open.spotify.com/..."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-rose-100/80">Color de acento</span>
              <input
                type="color"
                value={accent}
                onChange={(event) => {
                  setAccent(event.target.value);
                  setSaved(false);
                }}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 p-2"
              />
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
            <textarea
              rows={16}
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setSaved(false);
              }}
              className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-rose-50 outline-none transition focus:border-rose-300/40"
              style={{ borderColor: `${accent}55` }}
              placeholder="Escribile algo lindo..."
            />
          </label>

          {showPreview ? (
            <div className="rounded-[1.5rem] border bg-black/20 p-5" style={{ borderColor: `${accent}55` }}>
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>
                Preview
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-rose-50">{title || "Sin titulo"}</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-rose-100/80">{body || "Todavia no escribiste nada."}</p>
              {spotifyTrack ? <p className="mt-4 text-xs text-rose-100/55">Spotify: {spotifyTrack}</p> : null}
            </div>
          ) : null}

          {(title || body || spotifyTrack) && !saved ? (
            <p className="rounded-2xl border border-amber-200/20 bg-amber-200/5 px-4 py-3 text-sm text-amber-100/80">
              Tenes cambios sin guardar.
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !body.trim()}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-400 via-fuchsia-300 to-amber-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "guardando..." : saved ? "guardado" : "guardar borrador"}
          </button>
        </div>
      </div>
    </div>
  );
}
