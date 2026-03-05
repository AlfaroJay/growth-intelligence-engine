/**
 * Simple in-memory rate limiter.
 *
 * Suitable for single-instance deployments (Vercel serverless has ephemeral
 * state so this is a best-effort protection layer; upgrade to Upstash/Redis
 * for production multi-instance deployments).
 *
 * Limits: 3 submissions per IP per 15 minutes.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

/**
 * Returns true if the request should be allowed, false if rate-limited.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false; // Rate limited
  }

  entry.count += 1;
  store.set(ip, entry);
  return true;
}

/**
 * Returns remaining requests for an IP.
 */
export function getRemainingRequests(ip: string): number {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) return MAX_REQUESTS;
  return Math.max(0, MAX_REQUESTS - entry.count);
}
