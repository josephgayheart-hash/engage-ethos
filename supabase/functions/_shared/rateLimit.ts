import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RateLimitConfig {
  maxRequests?: number;
  windowSeconds?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, or combination)
 * @param endpoint - The endpoint being accessed
 * @param config - Rate limit configuration
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const maxRequests = config.maxRequests ?? 60;
  const windowSeconds = config.windowSeconds ?? 60;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Call the database function to check rate limit
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_endpoint: endpoint,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("Rate limit check error:", error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }

  const allowed = data === true;

  return {
    allowed,
    remaining: allowed ? maxRequests - 1 : 0,
    resetAt: new Date(Date.now() + windowSeconds * 1000),
  };
}

/**
 * Get the client IP address from request headers
 */
export function getClientIP(req: Request): string {
  // Check various headers that might contain the real IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.resetAt.toISOString());
  return headers;
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitExceededResponse(result: RateLimitResult): Response {
  const headers = createRateLimitHeaders(result);
  headers.set("Content-Type", "application/json");
  headers.set("Retry-After", Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString());

  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      retryAfter: result.resetAt.toISOString(),
    }),
    {
      status: 429,
      headers,
    }
  );
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventType: string,
  identifier: string | null,
  endpoint: string | null,
  severity: "info" | "warn" | "error" | "critical",
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase.from("security_events").insert({
    event_type: eventType,
    identifier,
    endpoint,
    severity,
    metadata,
  });

  if (error) {
    console.error("Failed to log security event:", error);
  }
}
