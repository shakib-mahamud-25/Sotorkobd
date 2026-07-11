import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateEditCode, hashEditCode } from "@/lib/editCode";
import type { NewReportInput } from "@/types";

// How many submissions from the same fingerprint within this window
// triggers an automatic flag for moderator review.
const RATE_LIMIT_WINDOW_HOURS = 24;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

export async function POST(req: NextRequest) {
  try {
    const body: NewReportInput & { fingerprint?: string } = await req.json();

    // Basic validation
    if (
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number" ||
      !body.category_id ||
      typeof body.severity !== "number" ||
      body.severity < 1 ||
      body.severity > 5
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const fingerprint = body.fingerprint || "unknown";

    // Check submission rate for this fingerprint
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();

    const { count } = await supabase
      .from("submission_log")
      .select("*", { count: "exact", head: true })
      .eq("submitter_fingerprint", fingerprint)
      .gte("created_at", windowStart);

    const shouldFlag = (count ?? 0) >= RATE_LIMIT_MAX_SUBMISSIONS;

    // Generate the edit code — shown to the user ONCE in the response,
    // never stored in plaintext.
    const editCode = generateEditCode();
    const editCodeHash = hashEditCode(editCode);

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        latitude: body.latitude,
        longitude: body.longitude,
        area_name: body.area_name ?? null,
        location_precision: body.location_precision,
        category_id: body.category_id,
        additional_categories: body.additional_categories ?? [],
        description: body.description?.slice(0, 2000) ?? null,
        severity: body.severity,
        time_of_day: body.time_of_day ?? null,
        incident_date: body.incident_date ?? null,
        police_contacted: body.police_contacted ?? false,
        status: shouldFlag ? "flagged" : "published",
        is_seed: false,
        edit_code_hash: editCodeHash,
        submitter_fingerprint: fingerprint,
      })
      .select("id")
      .single();

    if (error || !report) {
      console.error("Report insert error:", error);
      return NextResponse.json(
        { error: "Could not save report. Please try again." },
        { status: 500 }
      );
    }

    // Log this submission for future rate-limit checks
    await supabase.from("submission_log").insert({
      submitter_fingerprint: fingerprint,
      report_id: report.id,
    });

    if (shouldFlag) {
      await supabase.from("report_flags").insert({
        report_id: report.id,
        reason: "rate_limit",
      });
    }

    return NextResponse.json({
      reportId: report.id,
      editCode, // returned once, client must save it — never retrievable again
      flagged: shouldFlag,
    });
  } catch (err) {
    console.error("Unexpected error in POST /api/reports:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
