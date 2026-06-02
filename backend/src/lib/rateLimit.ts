/**
 * In-memory token bucket rate limiter.
 *
 * Cloudflare Workers share isolate state across requests served by the same
 * isolate, so a Map is fine for per-IP limiting within a single isolate. For
 * global enforcement across regions, swap this for Cloudflare KV or Durable
 * Objects.
 */
interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Maximum tokens in the bucket. */
  capacity: number;
  /** Tokens added per second. */
  refillRate: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: options.capacity, lastRefill: now };

  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(options.capacity, bucket.tokens + elapsed * options.refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfter: 0 };
  }

  buckets.set(key, bucket);
  const retryAfter = Math.ceil((1 - bucket.tokens) / options.refillRate);
  return { allowed: false, remaining: 0, retryAfter };
}

export function clientIp(request: Request, fallback = 'unknown'): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    fallback
  );
}
