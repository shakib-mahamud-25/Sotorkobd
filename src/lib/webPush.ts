import webpush from "web-push";

// One new dependency this phase: `web-push` (npm). This is the standard,
// widely-used library for VAPID-signed Web Push — implementing the signing
// scheme by hand would mean hand-rolling ECDSA/JWT logic, which is exactly
// the kind of thing a solo-maintained safety product should not be
// reinventing. No other new service or SaaS dependency is introduced by
// this phase; delivery itself goes through the browser vendors' own push
// infrastructure (Google/Mozilla/Apple), which is free and requires no
// account signup beyond generating a VAPID keypair.
//
// Scope note: the actual digest send job lives in a Supabase Edge Function
// (supabase/functions/send-digest/index.ts), not here — Deno's runtime
// can't import this Next.js-side module. This file exists for one thing:
// letting the app send a single test push to verify a subscription just
// worked, right after the user opts in (see /api/push/test below). It is
// NOT used for the recurring digest.
//
// Generate VAPID keys once, locally, with: npx web-push generate-vapid-keys
// Then set as environment variables (Vercel + .env.local), never commit them:
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//   VAPID_SUBJECT (must be "mailto:you@example.com" or an https:// URL —
//     Apple's push service rejects other formats with a 403, confirmed
//     during V2 research)

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    throw new Error(
      "VAPID environment variables are not set. See src/lib/webPush.ts for setup."
    );
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  configured = true;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface SendResult {
  endpoint: string;
  ok: boolean;
  expired: boolean; // true on a 404/410 — subscription is gone, caller should mark it expired
}

/**
 * Sends one push notification to one subscription. Never throws on a
 * per-subscription failure — the caller sends to many subscriptions and
 * one bad endpoint (expired, revoked, malformed) must not abort the batch.
 * iOS note: the corresponding service worker push handler MUST call
 * showNotification for every push it receives. iOS silently revokes a
 * subscription after repeated "silent" pushes (a push delivered without a
 * visible notification) — see public/sw.js.
 */
export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: { title: string; body: string; url?: string }
): Promise<SendResult> {
  ensureConfigured();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { endpoint: subscription.endpoint, ok: true, expired: false };
  } catch (err) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    const expired = statusCode === 404 || statusCode === 410;
    if (!expired) {
      console.error("Push send error:", subscription.endpoint, err);
    }
    return { endpoint: subscription.endpoint, ok: false, expired };
  }
}
