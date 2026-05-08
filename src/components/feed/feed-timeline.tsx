"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AccountId, FeedItem, FeedPage } from "@/lib/types";
import { FeedCardActivity } from "./feed-card-activity";
import { FeedCardLetter } from "./feed-card-letter";
import { FeedCardStack } from "./feed-card-stack";

function itemKey(item: FeedItem) {
  return item.id;
}

function renderFeedItem(item: FeedItem, viewerId?: AccountId) {
  if (item.kind === "activity") {
    return <FeedCardActivity item={item} />;
  }

  return item.versionCount > 1 ? <FeedCardStack item={item} /> : <FeedCardLetter item={item} viewerId={viewerId} />;
}

export function FeedTimeline({ initialPage, optimisticItems, viewerId }: { initialPage: FeedPage; optimisticItems: FeedItem[]; viewerId?: AccountId }) {
  const [items, setItems] = useState<FeedItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const seenOptimisticIds = useRef(new Set<string>());

  useEffect(() => {
    if (!optimisticItems.length) return;

    setItems((current) => {
      const next = [...current];
      for (const item of optimisticItems) {
        if (seenOptimisticIds.current.has(item.id)) continue;
        seenOptimisticIds.current.add(item.id);
        next.unshift(item);
      }
      return next;
    });
  }, [optimisticItems]);

  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = itemKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !nextCursor) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/feed?cursor=${encodeURIComponent(nextCursor)}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No pudimos cargar más del feed.");
      }

      const payload = (await response.json()) as FeedPage;
      setItems((current) => [...current, ...payload.items]);
      setNextCursor(payload.nextCursor);
      setHasMore(payload.hasMore);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pudimos cargar más del feed.");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, nextCursor]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "420px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div className="space-y-5">
      {uniqueItems.length ? (
        uniqueItems.map((item) => <div key={itemKey(item)}>{renderFeedItem(item, viewerId)}</div>)
      ) : (
        <div className="border-t border-b border-[color:var(--border)] py-16 text-center">
          <p className="font-serif text-2xl text-[color:var(--ink)]">Todavía no hay cartas</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[color:var(--ink-muted)]">
            Este es el hilo compartido entre Leandro y Miranda. Abrí el compositor y dejá la primera huella — una carta, un pensamiento, lo que sea.
          </p>
        </div>
      )}

      <div ref={sentinelRef} className="timeline-sentinel" aria-hidden="true" />

      {loading ? <div className="py-4 text-center text-sm text-[color:var(--ink-muted)]">trayendo más cartas…</div> : null}
      {error ? (
        <div className="border border-[color:var(--border)] p-4 text-sm text-[color:var(--wine)]">
          {error}
          <button type="button" onClick={() => void loadMore()} className="ml-3 underline underline-offset-2">
            reintentar
          </button>
        </div>
      ) : null}
      {!hasMore && uniqueItems.length ? <div className="py-4 text-center text-sm text-[color:var(--ink-muted)]">Llegaste al comienzo del hilo.</div> : null}
    </div>
  );
}
