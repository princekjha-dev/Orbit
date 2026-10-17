import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a privileged, server-only Supabase client using the Secret Key.
 *
 * CRITICAL SECURITY RULES:
 * 1. This client bypasses Row Level Security (RLS).
 * 2. It must NEVER be imported into Client Components or browser code.
 * 3. It must NEVER be sent to the browser or logged.
 * 4. Use ONLY for trusted internal administrative tasks, background sync, or webhook verification.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "FATAL SECURITY VIOLATION: Privileged Supabase Admin client cannot be executed in the browser."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are set in server environment."
    );
  }

  return createSupabaseClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
