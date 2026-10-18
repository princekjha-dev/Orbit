import { RateLimiterMemory } from "rate-limiter-flexible";

// In-memory rate limiters for fast, deterministic throttling
const messageLimiter = new RateLimiterMemory({
  points: 30, // 30 messages
  duration: 60, // per 60 seconds
});

const inviteLimiter = new RateLimiterMemory({
  points: 15, // 15 invites
  duration: 3600, // per 1 hour
});

const verificationLimiter = new RateLimiterMemory({
  points: 5, // 5 verification requests
  duration: 3600, // per 1 hour
});

const reportLimiter = new RateLimiterMemory({
  points: 10, // 10 reports
  duration: 3600, // per 1 hour
});

export type RateLimitAction = "MESSAGE" | "INVITE" | "VERIFICATION" | "REPORT";

/**
 * Checks if a user action exceeds safety rate limits.
 * Returns true if permitted, false if rate limited.
 */
export async function checkRateLimit(userId: string, action: RateLimitAction): Promise<boolean> {
  const limiterMap: Record<RateLimitAction, RateLimiterMemory> = {
    MESSAGE: messageLimiter,
    INVITE: inviteLimiter,
    VERIFICATION: verificationLimiter,
    REPORT: reportLimiter,
  };

  const limiter = limiterMap[action];
  if (!limiter) return true;

  try {
    await limiter.consume(userId);
    return true;
  } catch {
    return false;
  }
}
