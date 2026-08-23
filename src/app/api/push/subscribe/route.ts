import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { DHAKA_AREAS } from "@/lib/dhakaAreas";

const VALID_AREA_NAMES = new Set(DHAKA_AREAS.map((a) => a.name));

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { endpoint, keys, areaName } = body as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    areaName?: string;
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth || !areaName) {
    return NextResponse.json(
      { error: "Subscription and area are required." },
      { status: 400 }
    );
  }

  // Only allow subscribing to a known Dhaka area, same list used by the
  // report form's location dropdown — prevents arbitrary free-text area
  // names from ever needing to be matched against report.area_name later.
  if (!VALID_AREA_NAMES.has(areaName)) {
    return NextResponse.json({ error: "Unknown area." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Upsert on (endpoint, area_name): re-subscribing to the same area from
  // the same device is a no-op rather than a duplicate row or an error.
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        area_name: areaName,
        is_expired: false,
      },
      { onConflict: "endpoint,area_name" }
    );

  if (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      { error: "Could not save subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
