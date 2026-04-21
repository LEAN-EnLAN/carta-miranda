import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDraftLetter, listDraftsForUser } from "@/lib/store";
import { getOtherAccountId } from "@/lib/constants";
import type { AccountId } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const drafts = await listDraftsForUser(user.id);
  return NextResponse.json({ drafts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  let title = "";
  let body = "";
  let recipientId: AccountId | undefined;
  let spotifyTrack: string | undefined;
  let accent: string | undefined;

  if (contentType.includes("application/json")) {
    const payload = await request.json();
    title = String(payload.title ?? "").trim();
    body = String(payload.body ?? "").trim();
    recipientId = payload.recipientId as AccountId | undefined;
    spotifyTrack = payload.spotifyTrack ? String(payload.spotifyTrack).trim() : undefined;
    accent = payload.accent ? String(payload.accent).trim() : undefined;
  } else {
    const formData = await request.formData();
    title = String(formData.get("title") ?? "").trim();
    body = String(formData.get("body") ?? "").trim();
    recipientId = (String(formData.get("recipientId") ?? "") || undefined) as AccountId | undefined;
    spotifyTrack = String(formData.get("spotifyTrack") ?? "").trim() || undefined;
    accent = String(formData.get("accent") ?? "").trim() || undefined;
  }

  if (!title || !body) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const draft = await createDraftLetter({
    authorId: user.id,
    recipientId: recipientId ?? getOtherAccountId(user.id),
    title,
    body,
    spotifyTrack,
    accent,
  });

  return NextResponse.json({ draft }, { status: 201 });
}
