-- ============================================================================
-- V2 MIGRATION: notification digest tracking
-- Run this in Supabase SQL Editor, AFTER migration 004.
--
-- Design choice: notifications are sent as a periodic DIGEST per area, not
-- one push per report. Firing a push on every single real report would
-- violate the spec's explicit "low-frequency, non-spammy" requirement —
-- an active area could otherwise generate several pushes an hour. Instead:
-- a scheduled job checks every 30 minutes for areas with new real reports
-- since that area's last digest, and sends ONE notification per area
-- covering however many new reports arrived ("3 new community reports
-- near Uttara"), matching the exact copy example in the spec.
--
-- This table only tracks *when an area was last notified*, not the
-- content of what was sent — the actual send logic (Phase 4 app code)
-- queries reports directly using this timestamp as the "since" boundary.
-- ============================================================================

create table area_notification_state (
  area_name text primary key,
  last_notified_at timestamptz not null default now()
);

alter table area_notification_state enable row level security;
-- No public policies — service role only, read/written exclusively by the
-- scheduled digest job.

-- ============================================================================
-- Digest eligibility check: which areas have new real reports since their
-- last notification AND have at least one active (non-expired) subscriber.
-- Called by the send job (implemented in application code, not SQL, since
-- it needs to call the Web Push API per subscription — Postgres can't make
-- outbound HTTP push requests on the free tier without extensions that
-- aren't guaranteed available). This function only identifies WHAT to send;
-- actually sending and then updating area_notification_state both happen
-- in the API route.
-- ============================================================================
create or replace function areas_pending_digest()
returns table(area_name text, new_report_count bigint) as $$
begin
  return query
  select
    r.area_name,
    count(*) as new_report_count
  from reports r
  where r.is_seed = false
    and r.status = 'published'
    and r.area_name is not null
    and r.created_at > coalesce(
      (select ans.last_notified_at from area_notification_state ans
       where ans.area_name = r.area_name),
      now() - interval '30 minutes' -- first-ever check for a never-notified area
    )
    and exists (
      select 1 from push_subscriptions ps
      where ps.area_name = r.area_name and ps.is_expired = false
    )
  group by r.area_name;
end;
$$ language plpgsql;
