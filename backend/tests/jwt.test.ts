import { describe, it, expect } from 'vitest';
import { signJWT, verifyJWT } from '../src/lib/jwt';

const SECRET = 'unit-test-secret-key-1234';

describe('JWT', () => {
  it('signs and verifies a valid token', async () => {
    const token = await signJWT({ sub: 'user-1', role: 'admin' }, SECRET);
    const ok = await verifyJWT(token, SECRET);
    expect(ok).toBe(true);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signJWT({ sub: 'user-1' }, SECRET);
    const ok = await verifyJWT(token, 'wrong-secret');
    expect(ok).toBe(false);
  });

  it('rejects a token with tampered body', async () => {
    const token = await signJWT({ role: 'admin' }, SECRET);
    const [h, _b, s] = token.split('.');
    const tampered = `${h}.${btoa(JSON.stringify({ role: 'admin', exp: 9999999999 })).replace(/=/g, '')}.${s}`;
    const ok = await verifyJWT(tampered, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects an expired token', async () => {
    const token = await signJWT({ role: 'admin' }, SECRET, -1);
    const ok = await verifyJWT(token, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects malformed tokens', async () => {
    expect(await verifyJWT('not-a-jwt', SECRET)).toBe(false);
    expect(await verifyJWT('a.b', SECRET)).toBe(false);
    expect(await verifyJWT('', SECRET)).toBe(false);
  });

  it('handles payloads with non-ASCII characters', async () => {
    const token = await signJWT({ name: '日本語ユーザー' }, SECRET);
    const ok = await verifyJWT(token, SECRET);
    expect(ok).toBe(true);
  });
});
