-- ============================================================================
-- V2 MIGRATION: schedule the notification digest via pg_cron + pg_net
-- Run this in Supabase SQL Editor, AFTER migration 005 and AFTER deploying
-- the send-digest Edge Function (supabase/functions/send-digest/index.ts).
--
-- Architecture note, why this isn't a Vercel cron route: Vercel's Hobby
-- (free) tier only allows once-per-day cron schedules — sub-daily requires
-- the $20/mo Pro plan. Running the digest send as a Supabase Edge Function,
-- triggered by pg_cron + pg_net, keeps this fully inside the free tier and
-- inside infrastructure already in use (Supabase), rather than adding a
-- third-party scheduler (e.g. cron-job.org) as a new dependency or forcing
-- a paid upgrade for one recurring job.
--
-- pg_net lets Postgres make outbound HTTP requests; it's a standard
-- Supabase extension alongside pg_cron, confirmed free-tier-available.
-- ============================================================================

create extension if not exists pg_net;

-- Project URL and anon key are needed to call the Edge Function's HTTP
-- endpoint. Store them in Supabase Vault rather than hardcoding in this
-- migration (this file is safe to commit; secrets should not be).
-- Run these two lines by hand in the SQL Editor once, filling in your real
-- values — do not commit actual values into this migration file:
--
--   select vault.create_secret('https://YOUR-PROJECT-REF.supabase.co', 'project_url');
--   select vault.create_secret('YOUR-ANON-KEY', 'anon_key');

select cron.schedule(
  'send-report-digest',
  '*/30 * * * *', -- every 30 minutes
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
