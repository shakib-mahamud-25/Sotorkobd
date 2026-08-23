-- ============================================================================
-- V2 MIGRATION: gradual, delayed seed-data retirement
-- Run this in Supabase SQL Editor, AFTER migrations 001 and 002.
--
-- Replaces the V1 behavior (maybe_purge_seed_data trigger): a real report
-- landing in a grid cell would, in the same transaction, instantly remove
-- ALL seed reports in that cell once a threshold was crossed. Two problems
-- with that:
--   1. All-or-nothing — no gradual thinning, just a jump-cut once threshold
--      is hit.
--   2. Instant — same-transaction removal means an attentive user could
--      correlate "a pin just disappeared" with "a real report was just
--      submitted here," a subtle tell against the product's anonymity goals.
--
-- New behavior:
--   - A real, published, non-seed report landing in a cell makes ONE
--     not-yet-scheduled seed report in that cell eligible for retirement,
--     by stamping retire_eligible_at a few hours in the future. It does NOT
--     remove anything itself and does not run synchronously with visible
--     effect.
--   - A scheduled job (pg_cron, runs every ~15 min) retires any seed report
--     whose retire_eligible_at has passed, one at a time, decoupled from
--     any single insert.
--   - Once a cell's real, published, non-seed report count reaches the
--     existing admin_settings threshold, ALL remaining seed reports in that
--     cell are marked eligible immediately (still retired via the same
--     delayed job, not synchronously) so the cell fully clears rather than
--     thinning forever one real report at a time.
-- ============================================================================

-- New column: when a seed report becomes eligible to be retired. Null means
-- "not yet eligible." The retirement job only acts on rows where this is
-- set AND in the past.
alter table reports add column retire_eligible_at timestamptz;

create index reports_retire_eligible_idx on reports (retire_eligible_at)
  where is_seed = true and status = 'published';

-- How long after becoming eligible a seed report waits before actual
-- removal. Configurable without a code change, same pattern as the existing
-- seed_threshold_per_area setting.
insert into admin_settings (key, value) values
  ('seed_retire_delay_hours', '3'::jsonb)
on conflict (key) do nothing;

-- ============================================================================
-- Replaces maybe_purge_seed_data(): no longer removes anything itself.
-- Instead, on a real published report insert, it marks ONE seed report in
-- the same grid cell as eligible for retirement (if one isn't already
-- pending), or — once the cell has crossed the real-data threshold — marks
-- ALL remaining seed reports in that cell as eligible at once, so the area
-- fully clears rather than thinning one-at-a-time forever.
-- ============================================================================
create or replace function mark_seed_retirement_eligibility()
returns trigger as $$
declare
  threshold int;
  delay_hours int;
  real_count int;
  grid_lat double precision;
  grid_lng double precision;
  eligible_at timestamptz;
begin
  if new.is_seed = true or new.status <> 'published' then
    return new;
  end if;

  select (value#>>'{}')::int into threshold
    from admin_settings where key = 'seed_threshold_per_area';
  select (value#>>'{}')::int into delay_hours
    from admin_settings where key = 'seed_retire_delay_hours';

  grid_lat := round(new.latitude::numeric, 2)::double precision;
  grid_lng := round(new.longitude::numeric, 2)::double precision;
  eligible_at := now() + make_interval(hours => coalesce(delay_hours, 3));

  select count(*) into real_count
  from reports
  where is_seed = false
    and status = 'published'
    and round(latitude::numeric, 2) = grid_lat
    and round(longitude::numeric, 2) = grid_lng;

  if real_count >= threshold then
    -- Threshold crossed: clear the whole cell. Still delayed, still one
    -- scheduled job doing the actual removal — this just marks everything
    -- remaining as eligible at once instead of thinning further.
    update reports
    set retire_eligible_at = eligible_at
    where is_seed = true
      and status = 'published'
      and retire_eligible_at is null
      and round(latitude::numeric, 2) = grid_lat
      and round(longitude::numeric, 2) = grid_lng;
  else
    -- Below threshold: mark exactly ONE not-yet-scheduled seed report in
    -- this cell as eligible, so the map thins gradually rather than jumping.
    update reports
    set retire_eligible_at = eligible_at
    where id = (
      select id from reports
      where is_seed = true
        and status = 'published'
        and retire_eligible_at is null
        and round(latitude::numeric, 2) = grid_lat
        and round(longitude::numeric, 2) = grid_lng
      limit 1
    );
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists reports_maybe_purge_seed on reports;
create trigger reports_mark_seed_eligibility
  after insert on reports
  for each row execute function mark_seed_retirement_eligibility();

-- Old function no longer used by any trigger; dropped to avoid confusion for
-- future readers of this schema.
drop function if exists maybe_purge_seed_data();

-- ============================================================================
-- The actual retirement job: run periodically, retires any seed report
-- whose eligibility window has passed. This is the ONLY place seed reports
-- are ever removed — decoupled from any single insert, so there is no
-- request/response window in which removal is observably tied to a
-- specific real submission.
-- ============================================================================
create or replace function retire_eligible_seed_reports()
returns void as $$
begin
  update reports
  set status = 'removed'
  where is_seed = true
    and status = 'published'
    and retire_eligible_at is not null
    and retire_eligible_at <= now();
end;
$$ language plpgsql;

-- Schedule it every 15 minutes. pg_cron is available on Supabase's free
-- tier — no external scheduler or paid add-on required.
select cron.schedule(
  'retire-eligible-seed-reports',
  '*/15 * * * *',
  $$select retire_eligible_seed_reports();$$
);

-- ============================================================================
-- To change the retirement delay later without a code deploy:
--   update admin_settings set value = '6'::jsonb where key = 'seed_retire_delay_hours';
-- ============================================================================
