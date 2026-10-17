import { createClient } from "@/lib/supabase/client";
import { signOut as nextAuthSignOut } from "next-auth/react";

/**
 * Universal logout handler for Orbit.
 * Terminates both Supabase and NextAuth sessions, cleans up client state,
 * and redirects securely to the login route.
 */
export async function logout(redirectTo: string = "/login") {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase signOut error:", err);
  }

  try {
    await nextAuthSignOut({ redirect: false });
  } catch (err) {
    console.warn("NextAuth signOut error:", err);
  }

  // Force full browser navigation to clear in-memory state
  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}
