import { NextResponse } from "next/server";
import webpush from "web-push";
import { getPushSubscriptions, removePushSubscription } from "@/lib/store";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_EMAIL) {
  throw new Error("VAPID keys not configured");
}

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, body: messageBody, url, icon } = body as {
      title: string;
      body: string;
      url?: string;
      icon?: string;
    };

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: "Missing required fields: title, body" },
        { status: 400 }
      );
    }

    const subscriptions = await getPushSubscriptions();
    const payload = JSON.stringify({
      title,
      body: messageBody,
      url: url ?? "/",
      icon: icon ?? "/icons/icon-192.png",
    });

    let sent = 0;
    let failed = 0;

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            payload
          );
          sent++;
        } catch (error: unknown) {
          // 410 Gone means the subscription is no longer valid
          if (
            typeof error === "object" &&
            error !== null &&
            "statusCode" in error &&
            (error as { statusCode: number }).statusCode === 410
          ) {
            await removePushSubscription(subscription.endpoint);
          }
          failed++;
        }
      })
    );

    return NextResponse.json({ sent, failed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send notifications" },
      { status: 500 }
    );
  }
}
