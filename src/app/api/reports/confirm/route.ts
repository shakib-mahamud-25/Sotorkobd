import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { reportId } = await req.json();

  if (!reportId) {
    return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Atomic increment via a Postgres function — see
  // supabase/migrations/001_atomic_confirm_increment.sql. This replaces the
  // previous fetch-then-write pattern, which could lose increments under
  // concurrent confirmations (two requests reading the same count before
  // either writes back). The database now performs the read, increment, and
  // write as a single statement, so this is safe under concurrency by
  // construction rather than by hoping requests don't overlap.
  const { data: newCount, error } = await supabase.rpc("increment_confirm_count", {
    p_report_id: reportId,
  });

  if (error) {
    console.error("Confirm increment error:", error);
    return NextResponse.json({ error: "Could not confirm report." }, { status: 500 });
  }

  if (newCount === null) {
    // Function returns null when no published report matched this id —
    // same "not found" case the old code caught via the initial select.
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, confirmCount: newCount });
}
