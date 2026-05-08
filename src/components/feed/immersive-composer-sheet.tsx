"use client";

import Link from "next/link";
import { useState } from "react";
import type { AccountId, FeedItem } from "@/lib/types";
import { encodeFeedCursor } from "@/lib/feed-cursor";
import { ComposerFields, ComposerPreview, isComposerReady, type ComposerValues } from "../write-form";
import { useImmersiveComposer } from "./immersive-composer-provider";

function createOptimisticLetterItem(values: ComposerValues, id: string, authorId: AccountId): FeedItem {
  const createdAt = new Date().toISOString();
  return {
    kind: "letter",
    id: `letter:${id}`,
    createdAt,
    cursor: encodeFeedCursor(createdAt, `letter:${id}`),
    visibleToViewer: true,
    versionCount: 1,
    letter: {
      id,
      title: values.title.trim(),
      body: values.body.trim(),
      authorId,
      status: "draft",
      createdAt,
      updatedAt: createdAt,
      publishedAt: null,
      recipientIds: [values.recipientId],
      spotifyTrack: values.spotifyTrack.trim() || undefined,
      accent: values.accent,
      versions: [
        {
          id: `${id}:version`,
          type: "created",
          title: values.title.trim(),
          body: values.body.trim(),
          authorId,
          createdAt,
          summary: "Borrador creado desde el compositor inmersivo.",
          spotifyTrack: values.spotifyTrack.trim() || undefined,
          accent: values.accent,
        },
      ],
    },
  };
}

export function ImmersiveComposerSheet({
  fallbackHref,
  authorId,
  onCreated,
}: {
  fallbackHref: string;
  authorId: AccountId;
  onCreated: (item: FeedItem) => void;
}) {
  const composer = useImmersiveComposer();
  const [localError, setLocalError] = useState<string | null>(null);

  const { draft, mode, error } = composer.state;
  const visible = mode !== "idle";
  const values: ComposerValues = {
    title: draft.title,
    body: draft.body,
    spotifyTrack: draft.spotifyTrack ?? "",
    accent: draft.accent,
    recipientId: draft.recipientId,
  };

  async function handleSubmit() {
    if (!isComposerReady(values)) {
      setLocalError("Escribí un título y un cuerpo antes de enviar.");
      return;
    }

    composer.markSubmitting();
    setLocalError(null);

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          body: values.body.trim(),
          spotifyTrack: values.spotifyTrack.trim() || undefined,
          accent: values.accent,
          recipientId: values.recipientId,
        }),
      });

      if (!response.ok) {
        throw new Error("No pudimos guardar el borrador. Probá otra vez.");
      }

      const payload = (await response.json()) as { draft: { id: string } };
      onCreated(createOptimisticLetterItem(values, payload.draft.id, authorId));
      composer.markSuccess();
      composer.close();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No pudimos guardar el borrador.";
      composer.markError(message);
      setLocalError(message);
    }
  }

  return (
    <div className={`fixed inset-0 z-40 transition ${visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
      <button
        type="button"
        aria-label="Cerrar compositor"
        onClick={composer.close}
        className="absolute inset-0 bg-[color:var(--ink)]/25"
      />

      <section
        className={[
          "composer-sheet absolute bottom-0 left-0 right-0 mx-auto w-full max-w-3xl",
          "border-b-0 px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-6",
          "transition duration-300 ease-out",
          visible ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-[color:var(--wine)]/75">Compositor inmersivo</p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight text-[color:var(--ink)]">Abrí la mesa sin salir del feed</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ink-muted)]">
              Guardá un borrador, revisalo en preview y seguí scrolleando. El estado vive en sessionStorage para que no se pierda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={fallbackHref} className="paper-button">
              mesa completa
            </Link>
            <button type="button" onClick={composer.close} className="paper-button">
              cerrar
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_24rem]">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <ComposerFields
              values={values}
              showPreview={mode === "preview"}
              onTogglePreview={composer.togglePreview}
              onChange={(patch) => composer.updateDraft(patch)}
              disabled={mode === "submitting"}
            />

            {mode === "preview" ? <ComposerPreview draft={values} /> : null}

            {error || localError ? <p className="text-sm text-[color:var(--wine)]">{error ?? localError}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={mode === "submitting" || !isComposerReady(values)} className="paper-button disabled:cursor-not-allowed disabled:opacity-50">
                {mode === "submitting" ? "guardando..." : "guardar borrador"}
              </button>
              <button type="button" onClick={composer.close} className="paper-button">
                volver al feed
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <section className="border border-[color:var(--border)] p-5">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Estado</p>
              <dl className="mt-4 space-y-3 text-sm text-[color:var(--ink-muted)]">
                <div className="flex items-center justify-between gap-4">
                  <dt>Modo</dt>
                  <dd className="text-[color:var(--ink)]">{mode}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Destino</dt>
                  <dd className="text-[color:var(--ink)]">{values.recipientId === "miranda" ? "Miranda" : "Leandro"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Acento</dt>
                  <dd className="text-[color:var(--ink)]">{values.accent}</dd>
                </div>
              </dl>
            </section>

            <section className="border border-[color:var(--border)] p-5">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Fallback</p>
              <p className="mt-4 text-sm leading-6 text-[color:var(--ink-muted)]">
                Si querés la mesa clásica, abrila acá. El compositor sigue disponible para entradas rápidas sin romper el flujo.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
