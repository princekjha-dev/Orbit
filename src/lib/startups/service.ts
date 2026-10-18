import { prisma } from "@/lib/db";
import { inMemoryStore, StoredStartup } from "@/lib/database/in-memory-store";

/**
 * Resolves a startup by either its database ID or its URL slug.
 * Gracefully falls back to inMemoryStore if PostgreSQL is unavailable.
 */
export async function resolveStartup(
  identifier: string,
  options?: { fullWorkspace?: boolean }
) {
  if (!identifier) return null;

  try {
    const includeClause = options?.fullWorkspace
      ? {
          members: {
            include: {
              user: {
                select: { id: true, name: true, username: true, image: true, email: true },
              },
            },
          },
          milestones: { orderBy: { createdAt: "asc" } },
          tasks: { orderBy: { createdAt: "desc" } },
          goals: { orderBy: { createdAt: "desc" } },
          hiringNeeds: { orderBy: { createdAt: "desc" } },
          projects: { take: 5 },
          _count: {
            select: { members: true, milestones: true, tasks: true, projects: true },
          },
        }
      : {
          members: true,
        };

    const startup = await Promise.race([
      prisma.startup.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
        include: includeClause as any,
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 1500)
      ),
    ]);

    if (startup) return startup;
  } catch {
    // Database offline or query timeout — fall back to inMemoryStore
  }

  // Fallback to in-memory store
  const stored = inMemoryStore.startups.get(identifier);
  if (stored) {
    return {
      ...stored,
      _count: {
        members: stored.members.length,
        milestones: stored.milestones.length,
        tasks: stored.tasks.length,
        projects: 0,
      },
    };
  }

  return null;
}

/**
 * List all active startups with optional filtering.
 */
export async function listStartups(filters?: {
  industry?: string;
  stage?: string;
  search?: string;
}) {
  try {
    const where: any = {};
    if (filters?.industry && filters.industry !== "ALL") {
      where.industry = filters.industry;
    }
    if (filters?.stage && filters.stage !== "ALL") {
      where.stage = filters.stage;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const startups = await Promise.race([
      prisma.startup.findMany({
        where,
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, username: true, image: true } },
            },
          },
          milestones: { take: 3 },
          hiringNeeds: { take: 3 },
          _count: { select: { members: true, milestones: true, tasks: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 1500)
      ),
    ]);

    if (startups && startups.length > 0) {
      return startups;
    }
  } catch {
    // fallback
  }

  // In-memory fallback
  const allStored = Array.from(new Set(inMemoryStore.startups.values()));
  let filtered = allStored;
  if (filters?.industry && filters.industry !== "ALL") {
    filtered = filtered.filter(
      (s) => s.industry.toLowerCase() === filters.industry!.toLowerCase()
    );
  }
  if (filters?.stage && filters.stage !== "ALL") {
    filtered = filtered.filter((s) => s.stage === filters.stage);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }

  return filtered.map((s) => ({
    ...s,
    _count: {
      members: s.members.length,
      milestones: s.milestones.length,
      tasks: s.tasks.length,
    },
  }));
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
  if (userRole === "ADMIN" || userRole === "PLATFORM_ADMIN") return true;

  return (
    startup.creatorId === userId ||
    startup.members.some((m) => m.userId === userId)
  );
}

