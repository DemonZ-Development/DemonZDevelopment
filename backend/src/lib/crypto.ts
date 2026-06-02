/**
 * Constant-time string comparison.
 *
 * Avoids early-exit timing leaks when comparing secrets such as
 * the admin password or a freshly-computed hash.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still run a comparison to keep timing roughly constant for attackers
    // probing the length.
    let diff = 1;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ 0;
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Hash a password using SHA-256. This is intentionally simple — the
 * project uses a single shared admin password, so the secret already
 * lives in a Wrangler secret. If you ever move to multi-user admin
 * accounts, swap this for a Workers-compatible bcrypt/argon2 lib.
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
