-- ============================================================================
-- V2 MIGRATION: atomic confirm-count increment
-- Run this in Supabase SQL Editor. Fixes a race condition where concurrent
-- "I experienced this too" clicks could read the same confirm_count and
-- overwrite each other's increment (fetch-then-write is not atomic).
--
-- This function performs the read + increment + write as a single atomic
-- statement inside Postgres, so concurrent calls are safe by construction.
-- Only affects published reports, same as the original app-level check.
-- ============================================================================

create or replace function increment_confirm_count(p_report_id uuid)
returns int as $$
declare
  new_count int;
begin
  update reports
  set confirm_count = confirm_count + 1
  where id = p_report_id
    and status = 'published'
  returning confirm_count into new_count;

  return new_count; -- null if no matching row (report missing or not published)
end;
$$ language plpgsql;

-- No RLS grant needed beyond what's already in place: this function is only
-- ever called from server-side API routes using the service-role client,
-- same as every other write path in this app.
