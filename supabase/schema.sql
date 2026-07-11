-- ============================================================================
-- SOTORKO DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABLE: categories
-- The 10 incident categories. Seeded below. Rarely changes.
-- ============================================================================
create table categories (
  id text primary key,              -- slug, e.g. 'catcalling'
  label_en text not null,
  label_bn text not null,
  icon text not null,               -- lucide icon name used in UI
  sort_order int not null default 0
);

insert into categories (id, label_en, label_bn, icon, sort_order) values
  ('verbal_harassment', 'Verbal Harassment', 'মৌখিক হয়রানি', 'MessageSquareWarning', 1),
  ('catcalling', 'Catcalling', 'ক্যাটকলিং', 'Volume2', 2),
  ('following_stalking', 'Following / Stalking', 'অনুসরণ / স্টকিং', 'Footprints', 3),
  ('groping_physical', 'Groping / Physical Contact', 'শারীরিক স্পর্শ', 'HandMetal', 4),
  ('indecent_exposure', 'Indecent Exposure', 'অশালীন আচরণ', 'EyeOff', 5),
  ('assault', 'Assault', 'হামলা', 'AlertTriangle', 6),
  ('unsafe_transport', 'Unsafe Transport (Bus/Rickshaw/CNG)', 'অনিরাপদ যানবাহন', 'Bus', 7),
  ('poor_lighting', 'Poor Lighting / Isolated Area', 'অপর্যাপ্ত আলো / নির্জন এলাকা', 'Lightbulb', 8),
  ('unwanted_photography', 'Unwanted Photography', 'অনাকাঙ্ক্ষিত ছবি তোলা', 'CameraOff', 9),
  ('other', 'Other', 'অন্যান্য', 'CircleEllipsis', 10);

-- ============================================================================
-- TABLE: reports
-- Core incident reports. No user accounts — anonymous by design.
-- Ownership is proven via edit_code_hash, never stored in plaintext.
-- ============================================================================
create table reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- location
  latitude double precision not null,
  longitude double precision not null,
  area_name text,                          -- e.g. "Mirpur 10", chosen from dropdown or reverse-geocode label
  location_precision text not null default 'approximate'
    check (location_precision in ('exact', 'approximate')),
    -- 'exact' = user granted GPS permission; 'approximate' = manual pin/dropdown

  -- content
  category_id text not null references categories(id),
  additional_categories text[] default '{}',  -- other category ids, for multi-category reports
  description text,
  severity smallint not null check (severity between 1 and 5),
  time_of_day text check (time_of_day in ('morning', 'afternoon', 'evening', 'night')),
  incident_date date,                          -- when it happened (may differ from created_at)
  police_contacted boolean default false,

  -- moderation
  status text not null default 'published'
    check (status in ('published', 'flagged', 'hidden', 'removed')),
  flag_reason text,
  is_seed boolean not null default false,      -- true for launch seed data, purged per-area once real data threshold met

  -- anonymous ownership
  edit_code_hash text not null,                -- sha-256 hash of the edit code; raw code never stored
  submitter_fingerprint text,                  -- coarse device/browser hash, for abuse-rate detection only (not identity)

  -- confirmations ("I experienced this too")
  confirm_count int not null default 0
);

create index reports_location_idx on reports (latitude, longitude);
create index reports_created_idx on reports (created_at desc);
create index reports_status_idx on reports (status);
create index reports_category_idx on reports (category_id);
create index reports_is_seed_idx on reports (is_seed);

-- ============================================================================
-- TABLE: report_media
-- Photos attached to reports. Always admin-only visibility (see privacy notes).
-- EXIF/GPS metadata must be stripped client-side or via Cloudinary before insert.
-- ============================================================================
create table report_media (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  cloudinary_public_id text not null,
  cloudinary_url text not null,
  faces_blurred boolean not null default false,
  created_at timestamptz not null default now()
);

create index report_media_report_idx on report_media (report_id);

-- ============================================================================
-- TABLE: report_flags
-- Automated + informal signals used to route reports to moderation.
-- ============================================================================
create table report_flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  reason text not null,             -- 'rate_limit', 'keyword', 'manual_review_requested'
  created_at timestamptz not null default now()
);

create index report_flags_report_idx on report_flags (report_id);

-- ============================================================================
-- TABLE: submission_log
-- Tracks submission frequency per fingerprint to detect spam/abuse patterns.
-- Not tied to identity — just a coarse rate-limiting signal.
-- ============================================================================
create table submission_log (
  id uuid primary key default gen_random_uuid(),
  submitter_fingerprint text not null,
  report_id uuid references reports(id) on delete set null,
  created_at timestamptz not null default now()
);

create index submission_log_fingerprint_idx on submission_log (submitter_fingerprint, created_at desc);

-- ============================================================================
-- TABLE: admin_settings
-- Simple key-value store for site-wide config (e.g. seed data thresholds).
-- ============================================================================
create table admin_settings (
  key text primary key,
  value jsonb not null
);

insert into admin_settings (key, value) values
  ('seed_threshold_per_area', '5'::jsonb);  -- real reports needed in an area before seed data there is purged

-- ============================================================================
-- FUNCTION: update updated_at on row change
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reports_set_updated_at
  before update on reports
  for each row execute function set_updated_at();

-- ============================================================================
-- FUNCTION: purge seed data once an area crosses the real-report threshold
-- Called after every new published, non-seed report insert.
-- "Area" is approximated by rounding lat/lng to ~1.1km grid cells.
-- ============================================================================
create or replace function maybe_purge_seed_data()
returns trigger as $$
declare
  threshold int;
  real_count int;
  grid_lat double precision;
  grid_lng double precision;
begin
  if new.is_seed = true or new.status <> 'published' then
    return new;
  end if;

  select (value#>>'{}')::int into threshold from admin_settings where key = 'seed_threshold_per_area';

  grid_lat := round(new.latitude::numeric, 2)::double precision;
  grid_lng := round(new.longitude::numeric, 2)::double precision;

  select count(*) into real_count
  from reports
  where is_seed = false
    and status = 'published'
    and round(latitude::numeric, 2) = grid_lat
    and round(longitude::numeric, 2) = grid_lng;

  if real_count >= threshold then
    update reports
    set status = 'removed'
    where is_seed = true
      and round(latitude::numeric, 2) = grid_lat
      and round(longitude::numeric, 2) = grid_lng;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger reports_maybe_purge_seed
  after insert on reports
  for each row execute function maybe_purge_seed_data();

-- ============================================================================
-- ROW LEVEL SECURITY
-- Public (anon) can: read published reports, insert new reports, insert media
-- for their own report, insert confirmations. Nothing else — edits/deletes/
-- moderation all go through server-side API routes using the service role key.
-- ============================================================================
alter table reports enable row level security;
alter table report_media enable row level security;
alter table report_flags enable row level security;
alter table submission_log enable row level security;
alter table categories enable row level security;
alter table admin_settings enable row level security;

-- categories: public read
create policy "categories are publicly readable"
  on categories for select
  using (true);

-- reports: public can read only published reports
create policy "published reports are publicly readable"
  on reports for select
  using (status = 'published');

-- reports: public can insert (submission form uses anon key)
create policy "anyone can submit a report"
  on reports for insert
  with check (true);

-- No public update/delete policy on reports — edits and deletes go through
-- a server-side API route that verifies the edit_code_hash using the
-- service role key (which bypasses RLS). This keeps the edit code
-- verification logic server-side, not exposed to the client.

-- report_media: public can insert (upload flow), no public read
-- (media is admin-only visibility per product decision)
create policy "anyone can attach media to a report"
  on report_media for insert
  with check (true);

-- report_flags, submission_log, admin_settings: no public access at all.
-- All access via service role key in API routes.

-- ============================================================================
-- DONE. Next: set your Project URL + anon key + service role key in Vercel
-- environment variables, per SETUP_GUIDE.md
-- ============================================================================
