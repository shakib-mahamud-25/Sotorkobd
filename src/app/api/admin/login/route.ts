import { NextRequest, NextResponse } from "next/server";
import { setAdminSession } from "@/lib/adminSession";
import { createServiceClient } from "@/lib/supabase/server";

// A single shared admin password with zero attempt limiting is brute-forceable.
// This keeps the single-password architecture (no multi-admin system — out of
// scope for V2) but adds a simple, free-tier-compatible rate limit backed by
// Postgres, mirroring the existing submission_log pattern used elsewhere in
// this app rather than introducing a new service (e.g. Redis) for this alone.
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

function getClientIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for; fall back to a constant so local/dev
  // requests still get a (shared) rate limit bucket instead of throwing.
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD env var is not set.");
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 500 }
    );
  }

  const ip = getClientIp(req);
  const supabase = createServiceClient();

  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { count: recentFailures } = await supabase
    .from("admin_login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("succeeded", false)
    .gte("created_at", windowStart);

  if ((recentFailures ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { password } = await req.json();
  const succeeded = password === adminPassword;

  // Log every attempt (success or failure) so the window above stays accurate.
  await supabase.from("admin_login_attempts").insert({
    ip_address: ip,
    succeeded,
  });

  if (!succeeded) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ success: true });
}
