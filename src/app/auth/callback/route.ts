import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { generateUsername } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  let next = searchParams.get("next") || "/dashboard";

  // Prevent open redirect vulnerabilities: Ensure next is a relative URL
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/dashboard";
  }

  // Handle explicit OAuth errors (e.g. user cancelled prompt)
  if (errorParam) {
    const errorMsg = errorDescription || errorParam;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMsg)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        // Safe database sync for the authenticated user
        try {
          const userEmail = data.user.email;
          if (userEmail) {
            const existing = await Promise.race([
              prisma.user.findFirst({
                where: {
                  OR: [{ id: data.user.id }, { email: userEmail }],
                },
              }),
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error("DB timeout")), 1500)
              ),
            ]);

            if (!existing) {
              const name =
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                userEmail.split("@")[0];
              const role = data.user.user_metadata?.role || "STUDENT";
              const username = generateUsername(name);

              await Promise.race([
                prisma.user.create({
                  data: {
                    id: data.user.id,
                    email: userEmail,
                    name,
                    username,
                    role,
                    profile: {
                      create: {},
                    },
                  },
                }),
                new Promise<null>((_, reject) =>
                  setTimeout(() => reject(new Error("DB timeout")), 1500)
                ),
              ]);
            }
          }
        } catch (dbErr) {
          // If database is offline or timed out, user still has a valid Supabase session
          console.warn(
            "[Auth Callback] Database profile sync deferred or offline:",
            dbErr
          );
        }

        return NextResponse.redirect(`${origin}${next}`);
      } else if (error) {
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(error.message)}`
        );
      }
    } catch (err: any) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          err?.message || "Authentication exchange failed"
        )}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
