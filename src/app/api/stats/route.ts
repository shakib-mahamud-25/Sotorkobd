import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// V2 fix, round 2: stats/Insights previously excluded is_seed reports
// entirely, so the homepage/Insights numbers never matched what was
// visibly on the map (which always showed all published reports,
// including seed). That mismatch was intentional in the first version of
// this fix — the goal then was making sure seed data was never presented
// AS real community data.
//
// The actual requirement, confirmed directly: seed data SHOULD count here
// too, for consistency across map/Insights/homepage — but only while it's
// still live. Once a seed report crosses the gradual retirement threshold
// (mark_seed_retirement_eligibility() + retire_eligible_seed_reports() in
// migration 003), its status flips to 'removed', not is_seed staying
// true forever. Since every query below already filters on
// status = 'published', simply removing the is_seed exclusion means these
// numbers automatically stay in sync with the map with zero extra sync
// logic: a seed report counts here for exactly as long as it's visible on
// the map, and stops counting the same moment the retirement job removes
// it — because both the map and this route are reading the same
// status = 'published' condition, driven by the same underlying data.
export async function GET() {
  const supabase = createServiceClient();

  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: reportsToday } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .gte("created_at", todayStart.toISOString());

  // Trend/breakdown data now includes seed reports too, for the same
  // consistency reason — matches whatever's currently live on the map.
  const { data: allReports } = await supabase
    .from("reports")
    .select("area_name, time_of_day, created_at, category_id, severity")
    .eq("status", "published")
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
    totalReports: totalReports ?? 0,
    reportsToday: reportsToday ?? 0,
    topAreas,
    dayVsNight: { day: dayCount, night: nightCount },
    weeklyTrend,
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
