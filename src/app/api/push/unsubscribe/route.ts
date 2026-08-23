import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Unsubscribing needs no separate proof of ownership beyond possessing the
// endpoint value itself, same anonymity-preserving logic as the rest of
// this app: the endpoint is only ever known to the device that created it
// and the server, never displayed or logged anywhere the user didn't
// generate it from. This mirrors why edit-code-based deletes don't require
// a separate account/session either.
export async function POST(req: NextRequest) {
  const { endpoint, areaName } = await req.json();

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint is required." }, { status: 400 });
  }

  const supabase = createServiceClient();

  let query = supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  // If an area is given, only unsubscribe from that area (device may follow
  // several). Without one, remove all of this device's subscriptions —
  // used when push permission itself is revoked at the OS level.
  if (areaName) {
    query = query.eq("area_name", areaName);
  }

  const { error } = await query;

  if (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json(
      { error: "Could not remove subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
