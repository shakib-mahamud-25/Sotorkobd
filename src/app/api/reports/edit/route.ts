import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyEditCode } from "@/lib/editCode";

// PATCH: edit an existing report (requires reportId + editCode)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { reportId, editCode, updates } = body;

  if (!reportId || !editCode) {
    return NextResponse.json(
      { error: "Report ID and edit code are required." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, edit_code_hash")
    .eq("id", reportId)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (!verifyEditCode(editCode, report.edit_code_hash)) {
    return NextResponse.json({ error: "Incorrect edit code." }, { status: 403 });
  }

  // Whitelist editable fields — never allow editing edit_code_hash, status,
  // is_seed, submitter_fingerprint, etc. through this endpoint.
  const allowedFields = [
    "description",
    "severity",
    "time_of_day",
    "incident_date",
    "police_contacted",
    "category_id",
    "additional_categories",
  ];
  const safeUpdates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in updates) safeUpdates[field] = updates[field];
  }

  const { error: updateError } = await supabase
    .from("reports")
    .update(safeUpdates)
    .eq("id", reportId);

  if (updateError) {
    console.error("Report update error:", updateError);
    return NextResponse.json({ error: "Could not update report." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE: remove a report (requires reportId + editCode)
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { reportId, editCode } = body;

  if (!reportId || !editCode) {
    return NextResponse.json(
      { error: "Report ID and edit code are required." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, edit_code_hash")
    .eq("id", reportId)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (!verifyEditCode(editCode, report.edit_code_hash)) {
    return NextResponse.json({ error: "Incorrect edit code." }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from("reports")
    .update({ status: "removed" })
    .eq("id", reportId);

  if (updateError) {
    console.error("Report delete error:", updateError);
    return NextResponse.json({ error: "Could not delete report." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
