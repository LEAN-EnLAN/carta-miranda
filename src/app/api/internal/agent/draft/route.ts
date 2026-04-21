import { NextResponse } from "next/server";
import { draftAgentLetter } from "@/lib/automation/service";
import type { AccountId } from "@/lib/types";

function authorized(request: Request) {
  const expected = process.env.AGENT_TOKEN;
  const provided = request.headers.get("x-agent-token");
  return Boolean(expected && provided && expected === provided);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json();
  const result = await draftAgentLetter({
    authorId: payload.authorId as AccountId,
    recipientUsername: payload.recipientUsername as AccountId,
    topic: String(payload.topic ?? "Carta automatizada"),
    tone: payload.tone ? String(payload.tone) : undefined,
  });
  return NextResponse.json(result);
}
