import { describe, it, expect } from 'vitest';
import { timingSafeEqual, sha256Hex } from '../src/lib/crypto';

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
  });

  it('returns false for different strings of the same length', () => {
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
  });

  it('returns false for strings of different lengths', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    expect(timingSafeEqual('', 'x')).toBe(false);
  });

  it('returns true for empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true);
  });
});

describe('sha256Hex', () => {
  it('produces 64 hex characters', async () => {
    const hash = await sha256Hex('hello');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('matches the known SHA-256 of "hello"', async () => {
    // sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    const hash = await sha256Hex('hello');
    expect(hash).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  it('produces different hashes for different inputs', async () => {
    const a = await sha256Hex('foo');
    const b = await sha256Hex('bar');
    expect(a).not.toBe(b);
  });
});
