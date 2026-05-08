import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LetterEditor } from "@/components/letter-editor";
import { SpotifyEmbed } from "@/components/spotify-embed";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth";
import { getLetterDetail } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) return { title: "Carta — carta-miranda" };
  const detail = await getLetterDetail(id, user.id);
  if (!detail) return { title: "Carta — carta-miranda" };
  return {
    title: `${detail.letter.title} — carta-miranda`,
    description: detail.letter.body.slice(0, 160),
  };
}

export default async function LetterAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const detail = await getLetterDetail(id, user.id);
  if (!detail) notFound();
  const track = detail.letter.spotifyTrack ?? detail.letter.versions[detail.letter.versions.length - 1]?.spotifyTrack;
  return (
    <div className="min-h-screen">
      <LetterEditor data={detail} />
      {track ? (
        <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 lg:px-8">
          <SpotifyEmbed track={track} />
        </div>
      ) : null}
    </div>
  );
}
