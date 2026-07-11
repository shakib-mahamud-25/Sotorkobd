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
    .select(
      "id, created_at, latitude, longitude, area_name, location_precision, category_id, additional_categories, description, severity, time_of_day, incident_date, police_contacted, confirm_count, is_seed"
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
