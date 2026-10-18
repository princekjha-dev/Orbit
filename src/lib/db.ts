import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Safely executes a Prisma database call with a timeout.
 * If the database is unreachable or slow, returns fallbackValue
 * instead of hanging or crashing the application.
 */
export async function safeDbCall<T>(
  queryFn: () => Promise<T>,
  fallbackValue: T | null = null,
  timeoutMs: number = 800
): Promise<T | null> {
  try {
    const result = await Promise.race([
      queryFn(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Database operation timed out")), timeoutMs)
      ),
    ]);
    return result ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}
