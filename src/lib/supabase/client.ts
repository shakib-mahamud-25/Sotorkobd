import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // This will show a clear error in the browser console during setup
  // if env vars are missing, rather than a confusing downstream failure.
  console.error(
    "Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
