import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/webPush";

// Sends one immediate confirmation push right after a successful
// subscribe, so the user gets instant feedback that notifications are
// actually working on their device — rather than opting in and having no
// idea whether it worked until (or if) a real digest eventually arrives.
// This is a single one-off send, not a recurring notification, and is not
// counted or throttled by the digest system.
export async function POST(req: NextRequest) {
  const { endpoint } = await req.json();

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint is required." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: subscription } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("endpoint", endpoint)
    .limit(1)
    .single();

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  }

  const result = await sendPushNotification(
    { endpoint: subscription.endpoint, p256dh: subscription.p256dh, auth: subscription.auth },
    {
      title: "Sotorko",
      body: "You're subscribed. You'll hear from us when there's new activity in this area.",
    }
  );

  if (!result.ok) {
    return NextResponse.json({ error: "Could not send test notification." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
