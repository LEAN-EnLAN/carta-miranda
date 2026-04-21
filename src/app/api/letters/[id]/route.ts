import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLetterDetail } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const letter = await getLetterDetail(id, user.id);
  if (!letter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ letter });
}
