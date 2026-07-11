import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/adminSession";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
