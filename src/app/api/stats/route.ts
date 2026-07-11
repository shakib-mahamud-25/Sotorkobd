import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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

  const { data: allReports } = await supabase
    .from("reports")
    .select("area_name, time_of_day, created_at")
    .eq("status", "published")
    .limit(5000);

  const areaCounts: Record<string, number> = {};
  let dayCount = 0;
  let nightCount = 0;
  const weeklyBuckets: Record<string, number> = {};

  for (const r of allReports ?? []) {
    if (r.area_name) {
      areaCounts[r.area_name] = (areaCounts[r.area_name] ?? 0) + 1;
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
  });
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
