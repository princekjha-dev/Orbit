import { prisma } from "@/lib/db";
import { User } from "@prisma/client";

/**
 * Resolves an organization by either its database ID or its URL slug.
 * Ensures consistent resolution across API routes and components.
 */
export async function resolveOrganization(identifier: string) {
  if (!identifier) return null;

  return prisma.organization.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier },
      ],
      isDeleted: false,
    },
    include: {
      members: true,
    },
  });
}

/**
 * Checks if a user has sufficient membership privileges in an organization.
 * Admins in the Orbit system bypass specific organization membership.
 */
export function verifyOrgAccess(
  org: { members: { userId: string; role: string }[] } | null,
  userId: string | undefined,
  userRole?: string,
  requiredRoles: string[] = ["OWNER", "ADMIN", "MEMBER"]
) {
  if (!org || !userId) return false;
  if (userRole === "ADMIN") return true;

  return org.members.some(
    (m) => m.userId === userId && requiredRoles.includes(m.role)
  );
}
