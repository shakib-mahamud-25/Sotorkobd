import { NextRequest, NextResponse } from "next/server";
import { setAdminSession } from "@/lib/adminSession";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD env var is not set.");
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ success: true });
}
