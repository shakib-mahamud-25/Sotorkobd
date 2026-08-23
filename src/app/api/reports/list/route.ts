import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Public read of published reports, with optional filters. Uses the
// service client purely for consistent server-side querying — RLS on the
// `reports` table already restricts anon reads to status = 'published',
// so this endpoint cannot leak flagged/hidden/removed reports.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const categoryIds = searchParams.get("categories")?.split(",").filter(Boolean);
  const severityMin = Number(searchParams.get("severityMin") ?? "1");
  const timeOfDay = searchParams.get("timeOfDay")?.split(",").filter(Boolean);
  const dateRange = searchParams.get("dateRange") ?? "all";

  const supabase = createServiceClient();

  let query = supabase
    .from("reports")
    // V2 fix (Phase 9, real overfetch confirmed by checking every field
    // SafetyMap.tsx actually reads): the previous select returned 15
    // columns per row; only 9 are ever rendered by the map component that
    // consumes this endpoint. location_precision, additional_categories,
    // incident_date, police_contacted, and is_seed were transferred on
    // every filter change without being used anywhere client-side. This
    // matters specifically because the spec's target usage (spec section
    // 15) is mobile, often slow, connections — at 2000 rows this is real
    // payload weight, not a rounding error. time_of_day and created_at are
    // kept because they're used for server-side filtering logic elsewhere
    // in this route (dateRange/timeOfDay query params) even though the map
    // doesn't render them directly, so removing them would be premature.
    .select(
      "id, created_at, latitude, longitude, area_name, category_id, description, severity, time_of_day, confirm_count"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (categoryIds && categoryIds.length > 0) {
    query = query.in("category_id", categoryIds);
  }

  if (severityMin > 1) {
    query = query.gte("severity", severityMin);
  }

  if (timeOfDay && timeOfDay.length > 0) {
    query = query.in("time_of_day", timeOfDay);
  }

  if (dateRange !== "all") {
    const days: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "6m": 182,
      "1y": 365,
    };
    const cutoff = new Date(
      Date.now() - (days[dateRange] ?? 0) * 24 * 60 * 60 * 1000
    ).toISOString();
    query = query.gte("created_at", cutoff);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Report list fetch error:", error);
    return NextResponse.json({ error: "Could not load reports." }, { status: 500 });
  }

  return NextResponse.json({ reports: data });
}



