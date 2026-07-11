import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/adminSession";

const VALID_STATUSES = ["published", "flagged", "hidden", "removed"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update report." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
