import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listNotificationsForUser } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await listNotificationsForUser(user.id);
  return NextResponse.json({ notifications });
}
