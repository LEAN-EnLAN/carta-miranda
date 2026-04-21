import { NextResponse } from "next/server";
import { sendAgentLetter } from "@/lib/automation/service";
import type { AccountId } from "@/lib/types";

function authorized(request: Request) {
  const expected = process.env.AGENT_TOKEN;
  const provided = request.headers.get("x-agent-token");
  return Boolean(expected && provided && expected === provided);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json();
  const result = await sendAgentLetter({
    authorId: payload.authorId as AccountId,
    draftId: payload.draftId ? String(payload.draftId) : undefined,
    recipientUsername: payload.recipientUsername as AccountId | undefined,
    content: payload.content ? String(payload.content) : undefined,
  });
  return NextResponse.json(result);
}
