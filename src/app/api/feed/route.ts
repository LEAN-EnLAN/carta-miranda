import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFeedPage } from "@/lib/store";

export function getFeedCursorFromRequest(request: Request) {
  return new URL(request.url).searchParams.get("cursor");
}

export function isInvalidFeedCursorError(error: unknown) {
  return error instanceof Error && error.message === "Invalid feed cursor";
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cursor = getFeedCursorFromRequest(request);

  try {
    const page = await getFeedPage(user.id, cursor);
    return NextResponse.json(page);
  } catch (error) {
    if (isInvalidFeedCursorError(error)) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    throw error;
  }
}
