import { promises as dns } from "node:dns";
import net from "node:net";

export interface SafeFetchResult {
  isSafe: boolean;
  status?: number;
  error?: string;
  contentType?: string;
}

/**
 * Checks whether an IP address belongs to private, loopback, or link-local ranges.
 */
export function isPrivateIP(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (Link-local / AWS metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // Broadcast
    if (parts[0] === 255) return true;
    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // ::1 (Loopback)
    if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
    // fe80::/10 (Link-local)
    if (normalized.startsWith("fe80:")) return true;
    // fc00::/7 (Unique local)
    if (normalized.startsWith("fc00:") || normalized.startsWith("fd00:")) return true;
    return false;
  }

  return true; // Unknown IP formats rejected by default
}

/**
 * Validates a target URL against SSRF threats and checks reachability.
 * Blocks private IP ranges, cloud metadata services, and excessive redirects.
 */
export async function validateSafeUrl(urlStr: string, timeoutMs = 4000): Promise<SafeFetchResult> {
  try {
    const parsed = new URL(urlStr);

    // Only HTTP and HTTPS are allowed
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isSafe: false, error: "Only HTTP and HTTPS protocols are permitted" };
    }

    const hostname = parsed.hostname;

    // Check for localhost / loopback aliases
    if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
      return { isSafe: false, error: "Access to local and internal hostnames is prohibited" };
    }

    // Resolve DNS and inspect resolved IP
    const addresses = await dns.resolve(hostname);
    if (!addresses || addresses.length === 0) {
      return { isSafe: false, error: "Hostname could not be resolved" };
    }

    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return { isSafe: false, error: `Resolved to restricted IP address: ${addr}` };
      }
    }

    // Perform lightweight HEAD request to verify reachability
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(urlStr, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "OrbitSecurityBot/1.0 (Safe Link Verifier)",
        },
      });

      return {
        isSafe: true,
        status: response.status,
        contentType: response.headers.get("content-type") || undefined,
      };
    } finally {
      clearTimeout(timer);
    }
  } catch (error: any) {
    return {
      isSafe: false,
      error: error.message || "Target link is unreachable or timed out",
    };
  }
}
