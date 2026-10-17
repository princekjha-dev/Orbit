import { auth } from "@/lib/auth/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { resolveOrbitRole, can, Capability } from "@/lib/auth/permissions";
import { OrbitRole } from "@/lib/auth/roles";

export async function getCurrentUser() {
  // 1. Check active NextAuth session
  const session = await auth();
  if (session?.user) {
    const user = session.user as any;
    user.orbitRole = resolveOrbitRole(user);
    return user;
  }

  // 2. Fall back to Supabase Auth SSR session if configured
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.email) {
      let dbUser: any = null;
      try {
        dbUser = await Promise.race([
          prisma.user.findFirst({
            where: {
              OR: [{ id: user.id }, { email: user.email }],
            },
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              role: true,
              image: true,
              isSuspended: true,
              organizations: {
                select: { role: true },
              },
              mentorProfile: {
                select: { id: true, isVerified: true },
              },
            },
          }),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("DB timeout")), 1500)
          ),
        ]);
      } catch {
        // DB unreachable
      }

      if (dbUser && !dbUser.isSuspended) {
        const orbitRole = resolveOrbitRole({
          ...dbUser,
          user_metadata: user.user_metadata,
        });
        return {
          ...dbUser,
          orbitRole,
        };
      }

      // Fallback: Return authenticated user context even if database is offline
      const orbitRole = resolveOrbitRole(user as any);
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split("@")[0],
        username: user.user_metadata?.username || user.email.split("@")[0],
        role: user.user_metadata?.role || "STUDENT",
        orbitRole,
      };
    }
  } catch {
    // Supabase SSR session not active or environment not initialized
  }

  return null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireCapability(capability: Capability) {
  const user = await requireAuth();
  if (!can(user, capability)) {
    redirect("/dashboard");
  }
  return user;
}

async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if ((user as any).role !== role) redirect("/dashboard");
  return user;
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN);
}

