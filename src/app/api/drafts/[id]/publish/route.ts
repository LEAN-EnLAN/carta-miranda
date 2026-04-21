import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publishLetter } from "@/lib/store";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const letter = await publishLetter({ letterId: id, userId: user.id });
  return NextResponse.json({ letter });
}
