import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markNotificationRead } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/", request.url));
  const { notificationId } = await params;
  await markNotificationRead(notificationId, user.id);
  return NextResponse.redirect(new URL("/", request.url));
}
