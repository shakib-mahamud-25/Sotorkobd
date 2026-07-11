import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { reportId } = await req.json();

  if (!reportId) {
    return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("confirm_count")
    .eq("id", reportId)
    .eq("status", "published")
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("reports")
    .update({ confirm_count: report.confirm_count + 1 })
    .eq("id", reportId);

  if (updateError) {
    return NextResponse.json({ error: "Could not confirm report." }, { status: 500 });
  }

  return NextResponse.json({ success: true, confirmCount: report.confirm_count + 1 });
}
