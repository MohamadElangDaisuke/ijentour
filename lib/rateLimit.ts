/**
 * Centralized in-memory sliding-window rate limiter for defense-in-depth protection.
 *
 * NOTE ON SERVERLESS (VERCEL) ARCHITECTURE:
 * This rate limiter operates per isolated Lambda container instance. It provides
 * effective defense-in-depth against rapid automated bursts on the same instance,
 * but is NOT a distributed global rate limiter. Full distributed rate limiting
 * across multi-region serverless requires shared storage (e.g., PostgreSQL or Redis).
 */

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

export class MemoryRateLimiter {
  private map = new Map<string, RateLimitBucket>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private lastPruneTime = Date.now();

  constructor(options: { windowMs: number; maxRequests: number }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
  }

  /**
   * Check whether the key (e.g. client IP) has exceeded the configured limit.
   * Returns true if rate limited (rejected), false if allowed.
   */
  public isLimited(key: string): boolean {
    const now = Date.now();

    // Periodic cleanup of expired entries (every 60 seconds or if map exceeds 2,000 keys)
    if (now - this.lastPruneTime > 60_000 || this.map.size > 2000) {
      this.prune(now);
    }

    const entry = this.map.get(key);

    if (!entry || now > entry.resetTime) {
      this.map.set(key, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    if (entry.count >= this.maxRequests) {
      return true;
    }

    entry.count += 1;
    return false;
  }

  private prune(now: number): void {
    this.lastPruneTime = now;
    for (const [key, bucket] of this.map.entries()) {
      if (now > bucket.resetTime) {
        this.map.delete(key);
      }
    }
  }
}

/**
 * Extract client IP securely from standard forwarded headers.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "127.0.0.1"
  );
}

// Pre-configured limiters with reasonable thresholds:
// 1. Login: Max 5 failed/attempts per 15 minutes per IP
export const loginRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
});

// 2. Booking creation: Max 15 reservations per 10 minutes per IP
export const bookingCreationRateLimiter = new MemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 15,
});

// 3. Contact message inquiries: Max 10 messages per 10 minutes per IP
export const contactRateLimiter = new MemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
});

// 4. Customer review submission: Max 5 reviews per 15 minutes per IP
export const reviewRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

// 5. OTP Generation & Verification: Max 5 requests per 10 minutes per IP
export const otpRateLimiter = new MemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
});


