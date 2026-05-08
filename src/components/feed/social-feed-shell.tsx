"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { FeedItem, FeedPage, RelationshipSummary } from "@/lib/types";
import { ImmersiveComposerLauncher } from "./immersive-composer-launcher";
import { ImmersiveComposerProvider } from "./immersive-composer-provider";
import { ImmersiveComposerSheet } from "./immersive-composer-sheet";
import { FeedTimeline } from "./feed-timeline";
import { DEFAULT_COMPOSER_ACCENT } from "../write-form";

export function SocialFeedShell({
  initialPage,
  relationship,
  children,
}: {
  initialPage: FeedPage;
  relationship: RelationshipSummary;
  children?: ReactNode;
}) {
  const [optimisticItems, setOptimisticItems] = useState<FeedItem[]>([]);

  return (
    <ImmersiveComposerProvider
      initialDraft={{
        recipientId: relationship.partnerId,
        title: "",
        body: "",
        spotifyTrack: "",
        accent: DEFAULT_COMPOSER_ACCENT,
        updatedAt: new Date().toISOString(),
      }}
    >
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[1fr_22rem]">
        <main className="feed-shell min-h-screen">
          <header className="mb-10 border-b border-[color:var(--border)] pb-6">
            <div className="space-y-3">
              <h1 className="font-serif text-3xl font-normal tracking-tight text-[color:var(--ink)] sm:text-4xl">{relationship.conversationLabel}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--ink-muted)]">{relationship.conversationSubtitle}</p>
              <p className="max-w-xl text-xs leading-5 text-[color:var(--ink-muted)]">
                Acá vive lo que se escriben. Cada carta, cada borrador, cada huella queda en el hilo.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href={`/${relationship.partnerId}`} className="text-sm font-medium uppercase tracking-wider text-[color:var(--ink)] hover:text-[color:var(--wine)]">
                Ver Perfil
              </Link>
              {relationship.unreadNotificationCount > 0 ? (
                <span className="border border-[color:var(--wine)] px-2 py-0.5 text-[11px] uppercase tracking-wider text-[color:var(--wine)]">
                  {relationship.unreadNotificationCount} sin leer
                </span>
              ) : null}
              <form action="/api/auth/logout" method="post">
                <button className="text-sm font-medium uppercase tracking-wider text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
                  Salir
                </button>
              </form>
              <div className="ml-auto">
                <ImmersiveComposerLauncher className="w-full md:w-auto" />
              </div>
            </div>
          </header>

          <section>
            <FeedTimeline initialPage={initialPage} optimisticItems={optimisticItems} viewerId={relationship.viewer.id} />
          </section>

          <ImmersiveComposerSheet
            fallbackHref={`/${relationship.partnerId}/write`}
            authorId={relationship.viewer.id}
            onCreated={(item) => setOptimisticItems((current) => [item, ...current])}
          />
        </main>

        {children ? (
          <div className="hidden xl:block">
            {children}
          </div>
        ) : null}
      </div>
    </ImmersiveComposerProvider>
  );
}
