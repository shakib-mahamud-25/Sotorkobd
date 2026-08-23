-- ============================================================================
-- V2 MIGRATION: push notification subscriptions
-- Run this in Supabase SQL Editor, AFTER migrations 001-003.
--
-- Scope, per the V2 spec: opt-in, area-based, low-frequency. NOT a general
-- notification platform. One subscription = one device following one area.
-- No categories, no frequency settings, no quiet hours in this phase —
-- those are explicitly deferred (spec section 5: "don't build a notification
-- preference management system with 20 options on day one").
--
-- Anonymity note: subscriptions are tied to a device (via the Web Push
-- subscription endpoint, which is opaque and device-specific) and an area
-- name, never to any identity. This is consistent with the rest of the
-- app's no-accounts model. A push subscription endpoint is not meaningfully
-- more identifying than the existing device fingerprint used for rate
-- limiting — both are coarse, device-scoped signals with no name/email/
-- phone attached.
-- ============================================================================

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- The Web Push subscription object's fields, stored as the browser gives
  -- them. endpoint is effectively the device's unique push address —
  -- unsubscribing/resubscribing changes it, so it doubles as the natural
  -- unique key per device+browser installation.
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,

  -- Which Dhaka area (matches DHAKA_AREAS names in src/lib/dhakaAreas.ts)
  -- this device wants notifications for. One row per device per area — a
  -- device following multiple areas has multiple rows.
  area_name text not null,

  -- Set on a 410 Gone response from the push service (subscription expired
  -- or was revoked client-side). Rows are excluded from future sends once
  -- true, and can be periodically cleaned up.
  is_expired boolean not null default false
);

create index push_subscriptions_area_idx on push_subscriptions (area_name)
  where is_expired = false;
create unique index push_subscriptions_endpoint_area_idx
  on push_subscriptions (endpoint, area_name);

alter table push_subscriptions enable row level security;

-- Public (anon key) can insert their own subscription (subscribe flow) and
-- delete by endpoint (unsubscribe flow, matches the anonymous edit-code
-- pattern used elsewhere — no auth token needed to remove your own
-- subscription, since you already have to possess your own device's
-- endpoint value to ask for its removal).
create policy "anyone can subscribe"
  on push_subscriptions for insert
  with check (true);

create policy "anyone can unsubscribe their own endpoint"
  on push_subscriptions for delete
  using (true);

-- No public select or update — sending notifications and marking expiry
-- both happen server-side via the service role key, same pattern as every
-- other write path in this app.
