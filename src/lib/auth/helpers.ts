import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if ((user as any).role !== role) redirect("/dashboard");
  return user;
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN);
}
