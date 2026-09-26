export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

// Whitelisted MIME types and their canonical file extensions.
export const ALLOWED_MIME_TYPES: Record<string, readonly string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'application/pdf': ['.pdf'],
  'application/zip': ['.zip'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};

// Extensions allowed only for downloadable artifacts (not inline images).
export const ALLOWED_ARCHIVE_TYPES: Record<string, readonly string[]> = {
  'application/gzip': ['.gz', '.tgz'],
  'application/x-tar': ['.tar'],
};

export const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

export interface MediaValidationResult {
  ok: boolean;
  error?: string;
  mime?: string;
  extension?: string;
}

/**
 * Validate an uploaded file against MIME + extension whitelists and size cap.
 * The file extension is derived from the declared MIME type, never from the
 * user-supplied filename.
 */
export function validateUpload(
  file: File,
  allowedTypes: Record<string, readonly string[]> = ALLOWED_MIME_TYPES,
  maxBytes: number = MAX_UPLOAD_BYTES,
): MediaValidationResult {
  if (file.size > maxBytes) {
    return { ok: false, error: `File too large (max ${maxBytes} bytes)` };
  }
  if (file.size === 0) {
    return { ok: false, error: 'File is empty' };
  }

  const mime = (file.type || '').toLowerCase().split(';')[0].trim();
  const allowedExtensions = allowedTypes[mime];
  if (!allowedExtensions) {
    return { ok: false, error: `MIME type not allowed: ${mime || 'unknown'}` };
  }

  // Derive the canonical extension from the MIME type, never from the filename.
  const extension = allowedExtensions[0];

  return { ok: true, mime, extension };
}

/**
 * Validate a content type returned by storage for serving.
 */
export function validateContentType(contentType: string): boolean {
  return ALLOWED_IMAGE_CONTENT_TYPES.has(contentType.toLowerCase().split(';')[0].trim());
}

/**
 * Sanitize a name parameter used in a URL path segment.
 */
export function sanitizeNameParam(name: string): string | null {
  if (!name || name.length > 255) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)) return null;
  if (name.includes('..')) return null;
  return name;
}
