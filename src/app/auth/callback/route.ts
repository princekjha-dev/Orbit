import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { generateUsername } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user exists in Orbit database
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ id: data.user.id }, { email: data.user.email! }],
        },
      });

      if (!existing && data.user.email) {
        const name = data.user.user_metadata?.name || data.user.email.split("@")[0];
        const role = data.user.user_metadata?.role || "STUDENT";
        let username = generateUsername(name);

        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email,
            name,
            username,
            role,
            profile: {
              create: {},
            },
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error if verification or exchange failed
  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
