import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY client. Uses the service role key, which bypasses Row Level
// Security. Never import this file from a "use client" component — it must
// only ever run inside API routes (src/app/api/**) or server components.
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel project settings."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
