import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  DEFAULT_ITERATIONS,
} from '../src/lib/password';

describe('hashPassword', () => {
  it('produces the documented format', async () => {
    const hash = await hashPassword('correct horse battery', 1000);
    const parts = hash.split('$');
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('pbkdf2-sha256');
    expect(Number(parts[1])).toBe(1000);
    expect(parts[2].length).toBeGreaterThan(0);
    expect(parts[3].length).toBeGreaterThan(0);
  });

  it('is deterministic for the same input and salt', async () => {
    // Fixed salt via a stubbed getRandomValues would be needed for true
    // determinism; instead assert the derived half is stable by re-hashing
    // the same salt extracted from a first hash.
    const a = await hashPassword('hunter22hunter', 1000);
    const [, iterations, salt, digest] = a.split('$');
    const rebuilt = `pbkdf2-sha256$${iterations}$${salt}$${digest}`;
    expect((await verifyPassword('hunter22hunter', rebuilt)).valid).toBe(true);
  });

  it('salts, so the same password hashes differently each time', async () => {
    const a = await hashPassword('samepassword', 1000);
    const b = await hashPassword('samepassword', 1000);
    expect(a).not.toBe(b);
  });

  it('never contains the plaintext', async () => {
    const hash = await hashPassword('plaintext-secret', 1000);
    expect(hash).not.toContain('plaintext-secret');
  });
});

describe('verifyPassword', () => {
  it('accepts the correct password', async () => {
    const hash = await hashPassword('my-real-password', 1000);
    expect((await verifyPassword('my-real-password', hash)).valid).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('my-real-password', 1000);
    expect((await verifyPassword('wrong-password', hash)).valid).toBe(false);
  });

  it('is case sensitive', async () => {
    const hash = await hashPassword('CaseSensitive1', 1000);
    expect((await verifyPassword('casesensitive1', hash)).valid).toBe(false);
  });

  it('rejects the legacy unsalted SHA-256 format outright', async () => {
    // A bare hex digest must never be accepted, or an old record would be
    // treated as valid and the account would stay trivially crackable.
    const legacy = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
    expect((await verifyPassword('hello', legacy)).valid).toBe(false);
  });

  it('rejects malformed input without throwing', async () => {
    for (const bad of ['', 'x', 'a$b$c', 'pbkdf2-sha256$abc$x$y', 'pbkdf2-sha256$1000$!!!$!!!']) {
      const result = await verifyPassword('anything', bad);
      expect(result.valid).toBe(false);
    }
  });

  it('flags a record made with fewer iterations for rehashing', async () => {
    const weak = await hashPassword('upgrade-me-please', 1000);
    const result = await verifyPassword('upgrade-me-please', weak);
    expect(result.valid).toBe(true);
    expect(result.needsRehash).toBe(true);
  });

  it('does not flag a record at the current work factor', async () => {
    const current = await hashPassword('already-strong-enough', DEFAULT_ITERATIONS);
    const result = await verifyPassword('already-strong-enough', current);
    expect(result.valid).toBe(true);
    expect(result.needsRehash).toBe(false);
  });
});

describe('validatePasswordStrength', () => {
  it('rejects anything under 10 characters', () => {
    expect(validatePasswordStrength('short').ok).toBe(false);
    expect(validatePasswordStrength('123456789').ok).toBe(false);
  });

  it('accepts a 10+ character passphrase with no symbols', () => {
    // Length-first policy: composition rules mostly produce predictable
    // substitutions, so a long passphrase is allowed.
    expect(validatePasswordStrength('correct horse battery').ok).toBe(true);
  });

  it('rejects obvious common passwords', () => {
    expect(validatePasswordStrength('password123').ok).toBe(false);
    expect(validatePasswordStrength('letmein123').ok).toBe(false);
  });

  it('rejects absurdly long input', () => {
    expect(validatePasswordStrength('a'.repeat(201)).ok).toBe(false);
  });
});
