import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteDraftLetter, getLetterById } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const draft = await getLetterById(id);
  if (!draft || draft.authorId !== user.id || draft.status !== "draft") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ draft });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteDraftLetter({ letterId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
