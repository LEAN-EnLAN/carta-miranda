import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDraftLetter } from "@/lib/store";
import { getOtherAccountId } from "@/lib/constants";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/", request.url));
  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return NextResponse.redirect(new URL("/?error=1", request.url));
  await createDraftLetter({ authorId: user.id, recipientId: getOtherAccountId(user.id), title, body });
  return NextResponse.redirect(new URL("/", request.url));
}
