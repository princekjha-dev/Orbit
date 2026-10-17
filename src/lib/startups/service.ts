import { prisma } from "@/lib/db";

/**
 * Resolves a startup by either its database ID or its URL slug.
 */
export async function resolveStartup(identifier: string) {
  if (!identifier) return null;

  return prisma.startup.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier },
      ],
    },
    include: {
      members: true,
    },
  });
}

/**
 * Checks if a user has sufficient membership privileges in a startup.
 */
export function verifyStartupAccess(
  startup: { creatorId: string; members: { userId: string }[] } | null,
  userId: string | undefined,
  userRole?: string
): boolean {
  if (!startup || !userId) return false;
  if (userRole === "ADMIN") return true;

  return (
    startup.creatorId === userId ||
    startup.members.some((m) => m.userId === userId)
  );
}
