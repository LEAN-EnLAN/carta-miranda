import { NextResponse } from "next/server";
import { addPushSubscription } from "@/lib/store";
import type { PushSubscription } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Missing required fields: endpoint, keys.p256dh, keys.auth" },
        { status: 400 }
      );
    }

    const subscription: PushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") ?? undefined,
    };

    await addPushSubscription(subscription);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to subscribe" },
      { status: 500 }
    );
  }
}
