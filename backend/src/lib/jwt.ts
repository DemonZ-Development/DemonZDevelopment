function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncode(new TextEncoder().encode(value));
}

function base64UrlDecodeToString(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLen));
  return binary;
}

function bytesFromBase64Url(value: string): Uint8Array {
  const str = base64UrlDecodeToString(value);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

export async function signJWT(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds = 86400,
): Promise<string> {
  const header = base64UrlEncodeString(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncodeString(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
  );

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
  const signature = base64UrlEncode(new Uint8Array(sig));
  return `${header}.${body}.${signature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, body, signature] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const sigBytes = bytesFromBase64Url(signature);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${header}.${body}`));
    if (!valid) return false;

    const payload = JSON.parse(base64UrlDecodeToString(body)) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
