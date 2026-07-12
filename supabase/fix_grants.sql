-- ============================================================================
-- FIX: grant table privileges to service_role and anon
-- Run this once in Supabase SQL Editor. Safe to re-run any time.
--
-- Why this is needed: Row Level Security policies control WHICH ROWS a role
-- can see, but the role still needs a base GRANT to touch the table at all.
-- This was missing from the original schema.sql, causing
-- "permission denied for table reports" (Postgres error 42501) even though
-- the RLS policies themselves were correct.
-- ============================================================================

-- service_role: used by our server-side API routes (bypasses RLS entirely,
-- but still needs base table grants first)
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- anon: used by the browser-side Supabase client (subject to RLS policies
-- already defined in schema.sql — this grant just allows it to attempt
-- the query at all; RLS then filters which rows it actually gets back)
grant usage on schema public to anon;
grant select, insert on public.reports to anon;
grant select on public.categories to anon;
grant insert on public.report_media to anon;

-- Ensure future tables also get these grants automatically (belt and
-- suspenders, in case more tables are added later via the Table Editor
-- instead of SQL)
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
