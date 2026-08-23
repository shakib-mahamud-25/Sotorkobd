"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// Opt-in "follow this area" control. Scope matches the spec exactly: pick
// one area, opt in, get a low-frequency digest — no category filters, no
// frequency settings, no quiet hours in this phase.
//
// iOS honesty: Web Push on iOS ONLY works inside an installed (home-screen)
// PWA — a Safari tab, even with the manifest/service worker present, has no
// access to PushManager at all (confirmed during V2 research). Silently
// showing a "Notify me" button that does nothing on iOS-not-installed would
// be a worse experience than telling the person exactly what to do. This
// component detects that case and shows install instructions instead of a
// dead button.

type SubscribeState = "idle" | "subscribing" | "subscribed" | "error";

function isIosNotInstalled(): boolean {
  if (typeof navigator === "undefined") return false;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  // display-mode: standalone is true when launched from the home screen.
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return isIos && !isStandalone;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  // V2 fix (Phase 9 typecheck): TypeScript's DOM lib types
  // PushSubscriptionOptionsInit.applicationServerKey as BufferSource backed
  // specifically by ArrayBuffer, not the wider ArrayBufferLike (which also
  // covers SharedArrayBuffer). Uint8Array.from(...)'s inferred type doesn't
  // guarantee that narrower backing, so allocate the buffer explicitly with
  // `new Uint8Array(length)` and fill it, which does have the correct
  // ArrayBuffer-backed type. Purely a type-level fix — the runtime behavior
  // is identical either way.
  const bytes = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

export function AreaFollowButton({ areaName }: { areaName: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<SubscribeState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [needsIosInstall, setNeedsIosInstall] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window);
    setNeedsIosInstall(isIosNotInstalled());
  }, []);

  async function handleSubscribe() {
    setState("subscribing");
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("idle");
        return; // User declined at the OS level — respect it silently, no retry nag.
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("Push is not configured.");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // required on every platform; iOS enforces this strictly
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          areaName,
        }),
      });

      if (!res.ok) throw new Error("Subscribe failed");

      // Best-effort confirmation push — failure here doesn't undo the
      // subscription, it's purely a "did this actually work" signal.
      fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint }),
      }).catch(() => null);

      setState("subscribed");
    } catch (err) {
      console.error("Push subscribe error:", err);
      setError(t("notify.error"));
      setState("error");
    }
  }

  async function handleUnsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint, areaName }),
        });
      }
      setState("idle");
    } catch (err) {
      console.error("Push unsubscribe error:", err);
    }
  }

  if (!supported) return null; // No Push API at all (older browser) — say nothing rather than show a dead control.

  if (needsIosInstall) {
    return (
      <Alert tone="info">
        {t("notify.iosInstallHint")}
      </Alert>
    );
  }

  if (state === "subscribed") {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={handleUnsubscribe}>
        <Check size={14} />
        {t("notify.subscribed")}
      </Button>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSubscribe}
        loading={state === "subscribing"}
      >
        {state === "subscribing" ? <BellOff size={14} /> : <Bell size={14} />}
        {t("notify.follow")}
      </Button>
      {error && (
        <div className="mt-2">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}
    </div>
  );
}
