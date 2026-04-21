import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { getProfileData } from "@/lib/store";
import type { AccountId } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const currentUser = await requireCurrentUser();
  const { username } = await params;
  if (username !== "leandro" && username !== "miranda") notFound();

  const accountId = username as AccountId;
  const profile = await getProfileData(accountId);
  const isOwner = currentUser.id === accountId;
  const targetId: AccountId = accountId === "leandro" ? "miranda" : "leandro";

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/55">Perfil</p>
            <h1 className="mt-2 text-3xl font-semibold text-rose-50">{profile.user.displayName}</h1>
            <p className="mt-2 text-sm text-rose-100/65">{profile.user.bio}</p>
          </div>
          <div className="flex gap-3">
            {!isOwner ? (
              <Link href={`/${accountId}/write`} className="rounded-2xl bg-gradient-to-r from-rose-400 via-fuchsia-300 to-amber-200 px-4 py-2 text-sm font-semibold text-zinc-950">
                enviar carta
              </Link>
            ) : (
              <Link href={`/${targetId}/write`} className="rounded-2xl bg-gradient-to-r from-rose-400 via-fuchsia-300 to-amber-200 px-4 py-2 text-sm font-semibold text-zinc-950">
                crear carta
              </Link>
            )}
            <Link href="/" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-rose-50">
              volver
            </Link>
          </div>
        </div>

        {isOwner ? (
          <section className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-rose-50">Borradores</h2>
              <span className="text-sm text-rose-100/55">{profile.drafts.length}</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {profile.drafts.length ? profile.drafts.map((letter) => (
                <Link key={letter.id} href={`/letters/${letter.id}`} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition hover:bg-white/[0.06]">
                  <h3 className="text-lg font-medium text-rose-50">{letter.title}</h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-rose-100/65">{letter.body}</p>
                </Link>
              )) : <p className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-8 text-sm text-rose-100/55">No hay borradores.</p>}
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-rose-50">Cartas publicadas</h2>
            <span className="text-sm text-rose-100/55">{profile.published.length}</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {profile.published.length ? profile.published.map((letter) => (
              <Link key={letter.id} href={`/letters/${letter.id}`} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition hover:bg-white/[0.06]">
                <h3 className="text-lg font-medium text-rose-50">{letter.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-rose-100/65">{letter.body}</p>
              </Link>
            )) : <p className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-8 text-sm text-rose-100/55">Todavia no hay cartas publicadas.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
