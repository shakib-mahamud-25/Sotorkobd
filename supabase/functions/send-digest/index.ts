// Supabase Edge Function: send-digest
// Deno runtime — deployed with `supabase functions deploy send-digest`.
//
// Triggered every 30 minutes by pg_cron + pg_net (see migration 006).
// For each area with new real reports since its last digest AND at least
// one active subscriber (areas_pending_digest(), migration 005), sends ONE
// push notification per area covering however many new reports arrived —
// never one push per report. This is the entire enforcement mechanism for
// the spec's "low-frequency, non-spammy" requirement: no per-report path to
// a push notification exists anywhere in this codebase.
//
// iOS note: every push sent here MUST result in a visible notification on
// the client. iOS silently revokes a subscription after repeated "silent"
// pushes (a push delivered without the service worker calling
// showNotification). See public/sw.js's push handler — it always calls
// showNotification, never conditionally.

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;
// The site URL to open when a notification is tapped. Set to the deployed
// Vercel URL, e.g. https://sotorko.vercel.app — used only for the
// notification payload's `url` field, not for auth.
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://sotorko.vercel.app";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: pendingAreas, error: pendingError } = await supabase.rpc(
    "areas_pending_digest"
  );

  if (pendingError) {
    console.error("areas_pending_digest error:", pendingError);
    return new Response(JSON.stringify({ error: pendingError.message }), {
      status: 500,
    });
  }

  if (!pendingAreas || pendingAreas.length === 0) {
    return new Response(JSON.stringify({ sent: 0, areas: 0 }), { status: 200 });
  }

  let totalSent = 0;

  for (const area of pendingAreas as { area_name: string; new_report_count: number }[]) {
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("area_name", area.area_name)
      .eq("is_expired", false);

    if (subError || !subscriptions) {
      console.error("Subscription fetch error for", area.area_name, subError);
      continue;
    }

    // Bilingual payload isn't practical here — we don't know each
    // subscriber's chosen language (no accounts, no stored preference in
    // this V2 scope). English is used as the notification text; tapping it
    // opens the map, which is already bilingual. Revisit if/when a
    // per-subscription language preference is added.
    const payload = JSON.stringify({
      title: "Sotorko",
      body:
        area.new_report_count === 1
          ? `1 new community report near ${area.area_name}.`
          : `${area.new_report_count} new community reports near ${area.area_name}.`,
      url: `${SITE_URL}/map?area=${encodeURIComponent(area.area_name)}`,
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        totalSent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription is gone (expired, revoked, or the device
          // unsubscribed at the OS level without telling the app). Mark it
          // so future digests skip it and it doesn't just fail forever.
          await supabase
            .from("push_subscriptions")
            .update({ is_expired: true })
            .eq("id", sub.id);
        } else {
          console.error("Push send failed:", sub.endpoint, err);
        }
      }
    }

    await supabase
      .from("area_notification_state")
      .upsert({ area_name: area.area_name, last_notified_at: new Date().toISOString() });
  }

  return new Response(
    JSON.stringify({ sent: totalSent, areas: pendingAreas.length }),
    { status: 200 }
  );
});
