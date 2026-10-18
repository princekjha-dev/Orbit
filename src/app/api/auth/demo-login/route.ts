import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_ROLE_LIST, getDemoAccountByRole, OrbitRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  // 1. Security Check: Only permitted in development or when explicitly enabled
  const isDemoAllowed =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoAllowed) {
    return NextResponse.json(
      { error: "Demo accounts are disabled in production mode." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const role: OrbitRole = body.role;

    if (!role || !DEMO_ROLE_LIST.includes(role)) {
      return NextResponse.json(
        { error: "Invalid demo role specified." },
        { status: 400 }
      );
    }

    const demoConfig = getDemoAccountByRole(role);
    const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD || "OrbitDemo@2026!";

    // 2. Attempt Supabase Auth sign-in using server client (with timeout)
    let authResult: any = null;
    let isSupabaseUnavailable = false;
    let supabase: any = null;

    try {
      supabase = await createServerSupabase();
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignored
      }

      const signInPromise = supabase.auth.signInWithPassword({
        email: demoConfig.email,
        password: demoPassword,
      });
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase connection timeout")), 1500)
      );
      authResult = await Promise.race([signInPromise, timeoutPromise]);
    } catch {
      isSupabaseUnavailable = true;
    }

    // If Supabase is unreachable (local container down, network refused, timeout),
    // enable seamless Offline Demo Mode so developers and evaluators can explore immediately.
    const isConnectionError =
      isSupabaseUnavailable ||
      (authResult?.error &&
        (authResult.error.message.toLowerCase().includes("fetch failed") ||
          authResult.error.message.toLowerCase().includes("econnrefused") ||
          authResult.error.message.toLowerCase().includes("timeout") ||
          authResult.error.message.toLowerCase().includes("connect")));

    if (isConnectionError) {
      return NextResponse.json({
        success: true,
        offlineMode: true,
        redirectUrl: "/dashboard",
        role,
        email: demoConfig.email,
        password: demoPassword,
        user: {
          id: `demo-${role.toLowerCase()}`,
          email: demoConfig.email,
          user_metadata: {
            name: demoConfig.name,
            username: demoConfig.username,
            role:
              role === "PLATFORM_ADMIN"
                ? UserRole.ADMIN
                : role === "FOUNDER"
                ? UserRole.FOUNDER
                : UserRole.STUDENT,
            orbitRole: role,
          },
        },
      });
    }

    // 4. If user not found in Supabase Auth, attempt on-demand provisioning via admin client
    if (authResult?.error && authResult.error.message.toLowerCase().includes("invalid login credentials")) {
      try {
        const adminSupabase = createAdminClient();
        const prismaRole =
          role === "PLATFORM_ADMIN"
            ? UserRole.ADMIN
            : role === "FOUNDER"
            ? UserRole.FOUNDER
            : UserRole.STUDENT;

        // Create or update in Supabase Auth
        const { data: adminCreated, error: adminCreateErr } =
          await adminSupabase.auth.admin.createUser({
            email: demoConfig.email,
            password: demoPassword,
            email_confirm: true,
            user_metadata: {
              name: demoConfig.name,
              username: demoConfig.username,
              role: prismaRole,
              orbitRole: role,
            },
          });

        if (!adminCreateErr && adminCreated?.user) {
          // Sync with Prisma DB if reachable
          try {
            await Promise.race([
              prisma.user.upsert({
                where: { email: demoConfig.email },
                update: {
                  name: demoConfig.name,
                  username: demoConfig.username,
                  role: prismaRole,
                  passwordHash: hashSync(demoPassword, 12),
                  isSuspended: false,
                },
                create: {
                  id: adminCreated.user.id,
                  email: demoConfig.email,
                  name: demoConfig.name,
                  username: demoConfig.username,
                  role: prismaRole,
                  passwordHash: hashSync(demoPassword, 12),
                  isSuspended: false,
                },
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 1200)),
            ]);
          } catch {
            // DB sync skipped if offline
          }

          // Re-attempt sign-in
          authResult = await supabase.auth.signInWithPassword({
            email: demoConfig.email,
            password: demoPassword,
          });
        }
      } catch (provisionErr) {
        console.warn("Auto-provisioning demo user failed:", provisionErr);
      }
    }

    if (authResult?.error) {
      // In development / demo mode, if Supabase cannot authenticate the demo account for any reason,
      // seamlessly fall back to Offline Demo Mode so the user can explore Orbit without obstacle.
      return NextResponse.json({
        success: true,
        offlineMode: true,
        redirectUrl: "/dashboard",
        role,
        email: demoConfig.email,
        password: demoPassword,
        user: {
          id: `demo-${role.toLowerCase()}`,
          email: demoConfig.email,
          user_metadata: {
            name: demoConfig.name,
            username: demoConfig.username,
            role:
              role === "PLATFORM_ADMIN"
                ? UserRole.ADMIN
                : role === "FOUNDER"
                ? UserRole.FOUNDER
                : UserRole.STUDENT,
            orbitRole: role,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      redirectUrl: "/dashboard",
      role,
      user: authResult.data.user,
      session: authResult.data.session,
    });
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during demo login." },
      { status: 500 }
    );
  }
}
