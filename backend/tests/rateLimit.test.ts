import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, clientIp } from '../src/lib/rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Re-importing for a fresh module each test would be ideal, but
    // the in-memory Map is module-scoped. Using a unique key per test
    // avoids cross-test pollution.
  });

  it('allows requests under the capacity', () => {
    const opts = { capacity: 3, refillRate: 0.1 };
    for (let i = 0; i < 3; i++) {
      const r = checkRateLimit(`test-a-${Date.now()}-${i}`, opts);
      expect(r.allowed).toBe(true);
    }
  });

  it('denies requests over the capacity', () => {
    const key = `test-b-${Date.now()}`;
    const opts = { capacity: 2, refillRate: 0.0001 };
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(false);
  });

  it('refills tokens over time', async () => {
    const key = `test-c-${Date.now()}`;
    const opts = { capacity: 1, refillRate: 1000 }; // 1000 tokens/sec
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(checkRateLimit(key, opts).allowed).toBe(true);
  });
});

describe('clientIp', () => {
  it('prefers cf-connecting-ip', () => {
    const req = new Request('https://x.com', {
      headers: { 'cf-connecting-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' },
    });
    expect(clientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-forwarded-for', () => {
    const req = new Request('https://x.com', {
      headers: { 'x-forwarded-for': '5.6.7.8, 10.0.0.1' },
    });
    expect(clientIp(req)).toBe('5.6.7.8');
  });

  it('returns fallback when no headers present', () => {
    expect(clientIp(new Request('https://x.com'))).toBe('unknown');
  });
});
