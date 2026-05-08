import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialFrame } from "@/components/editorial-frame";
import { FeedCardLetter } from "@/components/feed/feed-card-letter";
import { FeedCardStack } from "@/components/feed/feed-card-stack";
import { PaperSheet } from "@/components/paper-sheet";
import { requireCurrentUser } from "@/lib/auth";
import { getProfileData, getRelationshipSummary } from "@/lib/store";
import type { AccountId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  if (username !== "leandro" && username !== "miranda") return { title: "Carta Miranda" };
  const profile = await getProfileData(username as AccountId);
  return {
    title: `${profile.user.displayName} — carta-miranda`,
    description: `Cartas de ${profile.user.displayName}. ${profile.user.bio}`,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const currentUser = await requireCurrentUser();
  const { username } = await params;
  if (username !== "leandro" && username !== "miranda") notFound();

  const accountId = username as AccountId;
  const [profile, relationship] = await Promise.all([getProfileData(accountId), getRelationshipSummary(currentUser.id)]);
  const isOwner = currentUser.id === accountId;
  const targetId: AccountId = accountId === "leandro" ? "miranda" : "leandro";

  return (
    <EditorialFrame
      eyebrow="Perfil"
      title={profile.user.displayName}
      description={`${profile.user.bio} · ${relationship.conversationLabel}`}
      actions={
        <>
          {!isOwner ? (
            <Link href={`/${accountId}/write`} className="paper-button">
              enviar carta
            </Link>
          ) : (
            <Link href={`/${targetId}/write`} className="paper-button">
              crear carta
            </Link>
          )}
          <Link href="/" className="paper-button">
            volver
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <PaperSheet tone="raised" className="p-6 sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Nota biográfica</p>
          <p className="mt-4 max-w-3xl text-justify text-sm leading-8 text-[color:var(--ink)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:leading-none first-letter:text-[color:var(--wine)]">
            {profile.user.bio}
          </p>
        </PaperSheet>

        <PaperSheet tone="base" className="p-6 sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--wine)]/75">Contexto relacional</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="border border-[color:var(--border)] p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--wine)]/75">Compartidas</p>
              <p className="mt-3 font-serif text-3xl text-[color:var(--ink)]">{relationship.sharedLetterCount}</p>
            </div>
            <div className="border border-[color:var(--border)] p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--wine)]/75">Borradores</p>
              <p className="mt-3 font-serif text-3xl text-[color:var(--ink)]">{relationship.draftCount}</p>
            </div>
            <div className="border border-[color:var(--border)] p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--wine)]/75">Último pulso</p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--ink-muted)]">{relationship.conversationSubtitle}</p>
            </div>
          </div>
        </PaperSheet>

        {isOwner ? (
          <PaperSheet tone="base" className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl text-[color:var(--ink)]">Borradores</h2>
              <span className="border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--ink-muted)]">{profile.drafts.length}</span>
            </div>
            <div className="mt-5 space-y-0 overflow-hidden border border-[color:var(--border)]">
              {profile.drafts.length ? profile.drafts.map((letter) => <FeedCardLetter key={letter.id} item={{ kind: "letter", id: `letter:${letter.id}`, createdAt: letter.updatedAt, cursor: letter.updatedAt, letter, visibleToViewer: true, versionCount: letter.versions.length }} viewerId={currentUser.id} />) : <p className="px-4 py-8 text-sm text-[color:var(--ink-muted)] ledger-divider">No hay borradores.</p>}
            </div>
          </PaperSheet>
        ) : null}

        <PaperSheet tone="base" className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl text-[color:var(--ink)]">Cartas publicadas</h2>
              <span className="border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--ink-muted)]">{profile.published.length}</span>
          </div>
            <div className="mt-5 space-y-0 overflow-hidden border border-[color:var(--border)]">
            {profile.published.length ? profile.published.map((letter) => (
              <div key={letter.id}>
                {letter.versions.length > 1 ? (
                  <FeedCardStack item={{ kind: "letter", id: `letter:${letter.id}`, createdAt: letter.publishedAt ?? letter.updatedAt, cursor: letter.publishedAt ?? letter.updatedAt, letter, visibleToViewer: true, versionCount: letter.versions.length }} />
                ) : (
                  <FeedCardLetter item={{ kind: "letter", id: `letter:${letter.id}`, createdAt: letter.publishedAt ?? letter.updatedAt, cursor: letter.publishedAt ?? letter.updatedAt, letter, visibleToViewer: true, versionCount: letter.versions.length }} />
                )}
              </div>
            )) : <p className="px-4 py-8 text-sm text-[color:var(--ink-muted)] ledger-divider">Todavía no hay cartas publicadas.</p>}
            </div>
        </PaperSheet>
      </div>
    </EditorialFrame>
  );
}
