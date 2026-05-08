import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateLetter } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";
  let title = "";
  let body = "";
  let spotifyTrack: string | undefined;
  let accent: string | undefined;

  if (contentType.includes("application/json")) {
    const payload = await request.json();
    title = String(payload.title ?? "").trim();
    body = String(payload.body ?? "").trim();
    spotifyTrack = payload.spotifyTrack ? String(payload.spotifyTrack).trim() : undefined;
    accent = payload.accent ? String(payload.accent).trim() : undefined;
  } else {
    const formData = await request.formData();
    title = String(formData.get("title") ?? "").trim();
    body = String(formData.get("body") ?? "").trim();
    spotifyTrack = String(formData.get("spotifyTrack") ?? "").trim() || undefined;
    accent = String(formData.get("accent") ?? "").trim() || undefined;
  }

  if (!title || !body) return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  const letter = await updateLetter({ letterId: id, userId: user.id, title, body, spotifyTrack, accent });
  return NextResponse.json({ letter });
}
