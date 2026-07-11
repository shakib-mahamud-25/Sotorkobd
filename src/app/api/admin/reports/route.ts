import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/adminSession";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // 'flagged' | 'published' | 'hidden' | 'removed' | null (all)

  const supabase = createServiceClient();
  let query = supabase
    .from("reports")
    .select(
      "id, created_at, latitude, longitude, area_name, category_id, description, severity, status, flag_reason, is_seed, submitter_fingerprint, confirm_count"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load reports." }, { status: 500 });
  }

  // Also fetch media for these reports (admin-only visibility)
  const reportIds = (data ?? []).map((r) => r.id);
  const { data: media } = await supabase
    .from("report_media")
    .select("id, report_id, cloudinary_url, faces_blurred")
    .in("report_id", reportIds.length ? reportIds : ["none"]);

  return NextResponse.json({ reports: data, media: media ?? [] });
}
