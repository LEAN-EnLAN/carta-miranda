import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publishLetter, getPushSubscriptions, removePushSubscription } from "@/lib/store";
import webpush from "web-push";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_EMAIL) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function sendPushNotification(title: string, body: string, url: string) {
  if (!process.env.VAPID_PUBLIC_KEY) return;

  const subscriptions = await getPushSubscriptions();
  const payload = JSON.stringify({
    title,
    body,
    url,
    icon: "/icons/icon-192.png",
  });

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
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          (error as { statusCode: number }).statusCode === 410
        ) {
          await removePushSubscription(subscription.endpoint);
        }
      }
    })
  );
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const letter = await publishLetter({ letterId: id, userId: user.id });

  // Send push notification to all subscribers
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  await sendPushNotification(
    `Nueva carta de ${user.displayName}`,
    letter.title,
    `${appUrl}/letters/${letter.id}`
  );

  return NextResponse.json({ letter });
}
