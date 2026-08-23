import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// V2 fix: every query here previously filtered only on status='published',
// with no is_seed exclusion — meaning the ~25 launch seed reports were
// silently counted as real community reports in every homepage stat. This
// was found during the V2 audit and fixed before any Insights work was
// built on top of this route, since Insights would otherwise inherit the
// same mixing. Seed and real counts are now tracked separately so the UI
// can be explicit about what's real ("realTotalReports") vs. what's shown
// to avoid an empty map at launch ("seedTotalReports"), never blending them
// into one number presented as community data.
export async function GET() {
  const supabase = createServiceClient();

  const { count: realTotalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("is_seed", false);

  const { count: seedTotalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("is_seed", true);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: reportsToday } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("is_seed", false)
    .gte("created_at", todayStart.toISOString());

  // Trend/breakdown data: real reports only. Seed data is launch filler, not
  // a community signal, and must never appear in "what areas/times are
  // people reporting" breakdowns.
  const { data: allReports } = await supabase
    .from("reports")
    .select("area_name, time_of_day, created_at, category_id, severity")
    .eq("status", "published")
    .eq("is_seed", false)
    .limit(5000);

  const areaCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const severityCounts: Record<number, number> = {};
  let dayCount = 0;
  let nightCount = 0;
  const weeklyBuckets: Record<string, number> = {};

  for (const r of allReports ?? []) {
    if (r.area_name) {
      areaCounts[r.area_name] = (areaCounts[r.area_name] ?? 0) + 1;
    }
    if (r.category_id) {
      categoryCounts[r.category_id] = (categoryCounts[r.category_id] ?? 0) + 1;
    }
    if (typeof r.severity === "number") {
      severityCounts[r.severity] = (severityCounts[r.severity] ?? 0) + 1;
    }
    if (r.time_of_day === "morning" || r.time_of_day === "afternoon") {
      dayCount++;
    } else if (r.time_of_day === "evening" || r.time_of_day === "night") {
      nightCount++;
    }
    const weekKey = getWeekKey(new Date(r.created_at));
    weeklyBuckets[weekKey] = (weeklyBuckets[weekKey] ?? 0) + 1;
  }

  const topAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area_name, count]) => ({ area_name, count }));

  // Insights page shows more areas than the homepage strip needs — kept
  // separate from topAreas so the homepage payload shape (and StatsStrip.tsx,
  // which only ever reads topAreas[0]) doesn't change.
  const allAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([area_name, count]) => ({ area_name, count }));

  const categoryBreakdown = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([category_id, count]) => ({ category_id, count }));

  const severityDistribution = [1, 2, 3, 4, 5].map((severity) => ({
    severity,
    count: severityCounts[severity] ?? 0,
  }));

  const weeklyTrend = Object.entries(weeklyBuckets)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .slice(-8)
    .map(([week, count]) => ({ week, count }));

  return NextResponse.json({
    // Real community data — safe to present as "N community reports".
    realTotalReports: realTotalReports ?? 0,
    reportsToday: reportsToday ?? 0,
    topAreas,
    dayVsNight: { day: dayCount, night: nightCount },
    weeklyTrend,
    // Seed/launch filler count — present separately if shown at all (e.g.
    // "map also includes N illustrative example reports"), never folded
    // into realTotalReports.
    seedTotalReports: seedTotalReports ?? 0,
    // Added for the Insights page (Phase 6). Not consumed by StatsStrip.tsx,
    // so adding these fields doesn't touch the homepage.
    allAreas,
    categoryBreakdown,
    severityDistribution,
  });
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
