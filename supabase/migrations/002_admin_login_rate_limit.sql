-- ============================================================================
-- V2 MIGRATION: admin login rate limiting
-- Run this in Supabase SQL Editor.
--
-- The admin login previously had zero brute-force protection: a plain
-- password comparison with unlimited attempts. This adds a small attempt
-- log, mirroring the existing submission_log pattern already used for
-- report-submission rate limiting, so no new infrastructure is introduced.
--
-- No RLS needed beyond default-deny: this table is only ever touched via
-- the service-role client in the admin login route.
-- ============================================================================

create table admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  succeeded boolean not null,
  created_at timestamptz not null default now()
);

create index admin_login_attempts_ip_idx on admin_login_attempts (ip_address, created_at desc);

alter table admin_login_attempts enable row level security;
-- No public policies at all — service role only, same as report_flags/submission_log.

-- Optional housekeeping: old attempt rows aren't needed once outside the
-- rate-limit window. Not required for correctness (the query below only
-- looks at recent rows), but keeps the table small over time. Safe to run
-- periodically by hand; not required for V2.
-- delete from admin_login_attempts where created_at < now() - interval '7 days';
