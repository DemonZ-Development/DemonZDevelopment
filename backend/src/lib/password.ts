/**
 * Password hashing.
 *
 * PBKDF2-HMAC-SHA256 via WebCrypto. Chosen deliberately over bcrypt (no native
 * bindings in Workers) and Argon2id (needs a WASM module): WebCrypto is built
 * into both the Workers runtime and Node 18+, so the same code verifies a hash
 * regardless of where it runs.
 *
 * The previous implementation was a bare unsalted SHA-256, which is not a
 * password hash — a GPU computes billions of SHA-256 per second, so a leaked
 * hash is recovered in seconds. 600k iterations is OWASP's current floor for
 * PBKDF2-SHA256.
 *
 * Stored form:
 *   pbkdf2-sha256$<iterations>$<salt_b64>$<hash_b64>
 *
 * The iteration count lives in the stored value rather than a constant, so it
 * can be raised later without invalidating existing hashes: verify against
 * whatever the record says, and re-hash on the next successful login.
 */

const ALGORITHM = 'PBKDF2';
const HASH = 'SHA-256';
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;

/** OWASP's floor for PBKDF2-HMAC-SHA256. */
export const DEFAULT_ITERATIONS = 600_000;

/** Compare in constant time so a wrong password cannot be found by timing. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    ALGORITHM,
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt: salt as unknown as BufferSource,
      iterations,
      hash: HASH,
    },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(
  password: string,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derive(password, salt, iterations);
  return `pbkdf2-sha256$${iterations}$${toBase64(salt)}$${toBase64(derived)}`;
}

export interface VerifyResult {
  valid: boolean;
  /** True when the record used fewer iterations than we now require. */
  needsRehash: boolean;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<VerifyResult> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') {
    // Not one of ours. Refusing to "verify" avoids silently accepting a
    // legacy unsalted hash that is trivially reversible.
    return { valid: false, needsRehash: false };
  }

  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1) {
    return { valid: false, needsRehash: false };
  }

  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = fromBase64(parts[2]);
    expected = fromBase64(parts[3]);
  } catch {
    return { valid: false, needsRehash: false };
  }

  const actual = await derive(password, salt, iterations);
  return {
    valid: timingSafeEqual(actual, expected),
    needsRehash: iterations < DEFAULT_ITERATIONS,
  };
}

/**
 * Minimum viable password strength.
 *
 * Deliberately length-first rather than a composition rule: a 16-character
 * passphrase beats "P@ssw0rd!" every time, and forcing symbols mostly produces
 * predictable substitutions. Rejects only what is genuinely unusable.
 */
export function validatePasswordStrength(password: string): {
  ok: boolean;
  error?: string;
} {
  if (password.length < 10) {
    return { ok: false, error: 'Password must be at least 10 characters' };
  }
  if (password.length > 200) {
    return { ok: false, error: 'Password must be under 200 characters' };
  }
  const common = [
    'password',
    '12345678',
    'qwertyui',
    'letmein12',
    'administrator',
  ];
  const lowered = password.toLowerCase();
  if (common.some((c) => lowered.includes(c))) {
    return { ok: false, error: 'That password is too common' };
  }
  return { ok: true };
}
