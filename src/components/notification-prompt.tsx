"use client";

import { useCallback, useState } from "react";

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64(array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

type Status = "idle" | "checking" | "prompting" | "subscribing" | "subscribed" | "denied" | "unsupported" | "error";

function getInitialNotificationStatus(): Status {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  return "prompting";
}

export function NotificationPrompt() {
  const [status, setStatus] = useState<Status>(getInitialNotificationStatus);
  const [dismissed, setDismissed] = useState(false);

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    try {
      setStatus("subscribing");

      // Get VAPID public key
      const keyRes = await fetch("/api/push/vapid-key");
      if (!keyRes.ok) throw new Error("Failed to get VAPID key");
      const { publicKey } = await keyRes.json();

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: uint8ArrayToBase64(new Uint8Array(subscription.getKey("p256dh")!)),
            auth: uint8ArrayToBase64(new Uint8Array(subscription.getKey("auth")!)),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save subscription");
      setStatus("subscribed");
    } catch {
      setStatus("error");
    }
  }, []);

  const handleEnable = async () => {
    try {
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission === "granted") {
        await subscribe();
      } else {
        setStatus("denied");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (dismissed) return null;
  if (status === "checking" || status === "subscribing") {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-[color:var(--border)] bg-[color:var(--paper)] px-4 py-3 text-xs text-[color:var(--ink-muted)] shadow-lg">
        Configurando notificaciones…
      </div>
    );
  }
  if (status === "subscribed") {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-[color:var(--wine)]/20 bg-[color:var(--paper)] px-4 py-3 text-xs text-[color:var(--ink-muted)] shadow-lg">
        ✓ Notificaciones activadas
      </div>
    );
  }
  if (status === "denied" || status === "unsupported") return null;
  if (status === "error") {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-[color:var(--wine)]/20 bg-[color:var(--paper)] px-4 py-3 text-xs text-[color:var(--ink-muted)] shadow-lg">
        No se pudieron activar las notificaciones.
        <button onClick={handleDismiss} className="ml-2 text-[color:var(--wine)] underline">
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-[color:var(--border)] bg-[color:var(--paper)] p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--wine)]/10 text-sm">
          ✉
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-[color:var(--ink)]">No te pierdas ninguna carta</p>
          <p className="text-xs leading-5 text-[color:var(--ink-muted)]">
            Activá las notificaciones para recibir un aviso cada vez que haya una nueva carta.
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={handleDismiss}
          className="rounded-md px-3 py-1.5 text-xs text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
        >
          Ahora no
        </button>
        <button
          onClick={handleEnable}
          className="rounded-md bg-[color:var(--wine)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[color:var(--wine)]/90"
        >
          Activar
        </button>
      </div>
    </div>
  );
}
