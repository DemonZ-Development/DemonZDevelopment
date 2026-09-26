import { describe, it, expect } from 'vitest';
import {
  validateUpload,
  validateContentType,
  sanitizeNameParam,
  MAX_UPLOAD_BYTES,
  ALLOWED_MIME_TYPES,
} from '../src/lib/mediaValidation';

function makeFile(opts: { type?: string; size?: number; name?: string }): File {
  const size = opts.size ?? 1024;
  const blob = new Blob([new Uint8Array(size)], { type: opts.type ?? 'image/png' });
  const f = new File([blob], opts.name ?? 'photo.png', { type: opts.type ?? 'image/png' });
  // jsdom/Node File may not carry size from blob; force it for deterministic tests.
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('validateUpload', () => {
  it('accepts a whitelisted MIME type and derives the extension from MIME', () => {
    const r = validateUpload(makeFile({ type: 'image/png', name: 'evil.exe' }));
    expect(r.ok).toBe(true);
    expect(r.mime).toBe('image/png');
    expect(r.extension).toBe('.png');
  });

  it('rejects a non-whitelisted MIME type', () => {
    const r = validateUpload(makeFile({ type: 'text/html', name: 'page.html' }));
    expect(r.ok).toBe(false);
    expect(r.error).toContain('not allowed');
  });

  it('rejects an empty file', () => {
    const r = validateUpload(makeFile({ size: 0 }));
    expect(r.ok).toBe(false);
    expect(r.error).toContain('empty');
  });

  it('rejects a file over the size cap', () => {
    const r = validateUpload(makeFile({ size: MAX_UPLOAD_BYTES + 1 }));
    expect(r.ok).toBe(false);
    expect(r.error).toContain('too large');
  });

  it('accepts a file exactly at the size cap', () => {
    const r = validateUpload(makeFile({ size: MAX_UPLOAD_BYTES }));
    expect(r.ok).toBe(true);
  });

  it('strips MIME parameters before matching', () => {
    const r = validateUpload(makeFile({ type: 'image/png; charset=binary' }));
    expect(r.ok).toBe(true);
    expect(r.mime).toBe('image/png');
  });

  it('supports per-call whitelists (e.g. images only)', () => {
    const imagesOnly = { 'image/jpeg': ['.jpg'] };
    expect(validateUpload(makeFile({ type: 'image/png' }), imagesOnly).ok).toBe(false);
    expect(validateUpload(makeFile({ type: 'image/jpeg' }), imagesOnly).ok).toBe(true);
  });

  it('covers the expected default whitelist entries', () => {
    for (const mime of ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'application/zip']) {
      expect(mime in ALLOWED_MIME_TYPES).toBe(true);
    }
  });
});

describe('validateContentType', () => {
  it('accepts whitelisted image content types', () => {
    expect(validateContentType('image/png')).toBe(true);
    expect(validateContentType('image/jpeg')).toBe(true);
    expect(validateContentType('image/webp')).toBe(true);
  });

  it('rejects non-image content types (stored-XSS guard)', () => {
    expect(validateContentType('text/html')).toBe(false);
    expect(validateContentType('application/json')).toBe(false);
  });

  it('is case-insensitive and strips parameters', () => {
    expect(validateContentType('Image/PNG; charset=binary')).toBe(true);
  });
});

describe('sanitizeNameParam', () => {
  it('accepts simple safe names', () => {
    expect(sanitizeNameParam('hero.png')).toBe('hero.png');
    expect(sanitizeNameParam('scene-01_final.webp')).toBe('scene-01_final.webp');
  });

  it('rejects path traversal', () => {
    expect(sanitizeNameParam('../secret')).toBeNull();
    expect(sanitizeNameParam('a/../../b')).toBeNull();
  });

  it('rejects names with unsafe characters', () => {
    expect(sanitizeNameParam('has space.png')).toBeNull();
    expect(sanitizeNameParam('quote".png')).toBeNull();
    expect(sanitizeNameParam('')).toBeNull();
  });

  it('rejects over-long names', () => {
    expect(sanitizeNameParam('a'.repeat(256))).toBeNull();
    expect(sanitizeNameParam('a'.repeat(255))).not.toBeNull();
  });
});
