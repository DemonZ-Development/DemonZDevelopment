import { Hono } from 'hono';
import { query, queryOne, execute, transaction } from '../lib/db';
import { signJWT } from '../lib/jwt';
import { sha256Hex, timingSafeEqual } from '../lib/crypto';
import { checkRateLimit, clientIp } from '../lib/rateLimit';
import { validateUpload, ALLOWED_MIME_TYPES } from '../lib/mediaValidation';
import { adminAuth } from '../middleware/auth';
import type { Env } from '../types';

const adminRoutes = new Hono<{ Bindings: Env }>();

// Helper for dynamic INSERT
async function insertRow(env: Env, table: string, data: Record<string, unknown>) {
  const keys = Object.keys(data).filter((k) => data[k] !== undefined);
  const values = keys.map((k) => data[k]);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  return queryOne(env, sql, values);
}

// Helper for dynamic UPDATE
async function updateRow(env: Env, table: string, id: string, data: Record<string, unknown>) {
  const keys = Object.keys(data).filter((k) => k !== 'id' && data[k] !== undefined);
  const values = keys.map((k) => data[k]);
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  values.push(id);
  const sql = `UPDATE ${table} SET ${setClauses} WHERE id = $${values.length} RETURNING *`;
  return queryOne(env, sql, values);
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

adminRoutes.post('/login', async (c) => {
  const ip = clientIp(c.req.raw);
  const limit = checkRateLimit(`admin-login:${ip}`, {
    capacity: 5,
    refillRate: 1 / 30,
  });
  if (!limit.allowed) {
    return c.json({ error: 'Too many login attempts. Try again later.' }, 429);
  }

  const { password } = await c.req.json<{ password: string }>();
  if (typeof password !== 'string' || password.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const hash = await sha256Hex(password);
  const storedHash = (c.env.ADMIN_PASSWORD_HASH || '').trim();
  if (!timingSafeEqual(hash, storedHash)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await signJWT({ role: 'admin' }, c.env.JWT_SECRET);
  return c.json({ token });
});

// Protect all admin endpoints below
adminRoutes.use('/projects', adminAuth);
adminRoutes.use('/projects/*', adminAuth);
adminRoutes.use('/articles', adminAuth);
adminRoutes.use('/articles/*', adminAuth);
adminRoutes.use('/changelogs', adminAuth);
adminRoutes.use('/changelogs/*', adminAuth);
adminRoutes.use('/comments', adminAuth);
adminRoutes.use('/comments/*', adminAuth);
adminRoutes.use('/messages', adminAuth);
adminRoutes.use('/messages/*', adminAuth);
adminRoutes.use('/media/*', adminAuth);
adminRoutes.use('/studio-log', adminAuth);
adminRoutes.use('/studio-log/*', adminAuth);
adminRoutes.use('/backup/*', adminAuth);
adminRoutes.use('/mcp', adminAuth);
adminRoutes.use('/mcp/*', adminAuth);

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

adminRoutes.get('/projects', async (c) => {
  try {
    const projects = await query(c.env, 'SELECT * FROM projects ORDER BY updated_at DESC');
    return c.json(projects);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.post('/projects', async (c) => {
  const body = await c.req.json();
  try {
    const created = await insertRow(c.env, 'projects', body);
    return c.json(created, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.put('/projects/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  body.updated_at = new Date().toISOString();
  try {
    await updateRow(c.env, 'projects', id, body);
    return c.json({ message: 'Updated' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.delete('/projects/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'DELETE FROM projects WHERE id = $1', [id]);
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

adminRoutes.get('/articles', async (c) => {
  try {
    const articles = await query(
      c.env,
      'SELECT id, slug, title, summary, content, image_url, category, published, published_at, created_at FROM articles ORDER BY created_at DESC',
    );
    return c.json(articles);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.post('/articles', async (c) => {
  const body = await c.req.json();
  if (body.published && !body.published_at) {
    body.published_at = new Date().toISOString();
  }
  try {
    const created = await insertRow(c.env, 'articles', body);
    return c.json(created, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.put('/articles/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  if (body.published && !body.published_at) {
    body.published_at = new Date().toISOString();
  }
  try {
    await updateRow(c.env, 'articles', id, body);
    return c.json({ message: 'Updated' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.delete('/articles/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'DELETE FROM articles WHERE id = $1', [id]);
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// ---------------------------------------------------------------------------
// Changelogs
// ---------------------------------------------------------------------------

adminRoutes.post('/changelogs', async (c) => {
  const body = await c.req.json();
  try {
    const created = await insertRow(c.env, 'changelogs', body);
    return c.json(created, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.delete('/changelogs/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'DELETE FROM changelogs WHERE id = $1', [id]);
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

adminRoutes.get('/comments', async (c) => {
  try {
    const comments = await query(
      c.env,
      'SELECT id, user_name, user_email, comment_text, approved, created_at FROM comments ORDER BY created_at DESC',
    );
    return c.json(comments);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.put('/comments/:id/approve', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'UPDATE comments SET approved = true WHERE id = $1', [id]);
    return c.json({ message: 'Approved' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.delete('/comments/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'DELETE FROM comments WHERE id = $1', [id]);
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// ---------------------------------------------------------------------------
// Contact Messages
// ---------------------------------------------------------------------------

adminRoutes.get('/messages', async (c) => {
  try {
    const messages = await query(
      c.env,
      'SELECT id, name, email, message, read, created_at FROM contact_messages ORDER BY created_at DESC',
    );
    return c.json(messages);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.put('/messages/:id/read', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'UPDATE contact_messages SET read = true WHERE id = $1', [id]);
    return c.json({ message: 'Marked as read' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.delete('/messages/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'DELETE FROM contact_messages WHERE id = $1', [id]);
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// ---------------------------------------------------------------------------
// Studio Log
// ---------------------------------------------------------------------------

adminRoutes.get('/studio-log', async (c) => {
  try {
    const logs = await query(
      c.env,
      'SELECT id, entry_date, tag, title, body, display_order, published, created_at FROM studio_log ORDER BY display_order ASC, created_at DESC',
    );
    return c.json(logs);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.post('/studio-log', async (c) => {
  const body = await c.req.json();
  try {
    const created = await insertRow(c.env, 'studio_log', body);
    return c.json(created, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.put('/studio-log/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  try {
    await updateRow(c.env, 'studio_log', id, body);
    return c.json({ message: 'Updated' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.delete('/studio-log/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env, 'DELETE FROM studio_log WHERE id = $1', [id]);
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// ---------------------------------------------------------------------------
// Media Uploads (Stored in Postgres images table)
// ---------------------------------------------------------------------------

async function saveImageToDb(env: Env, file: File): Promise<{ fileName: string }> {
  const validation = validateUpload(file, ALLOWED_MIME_TYPES);
  if (!validation.ok) {
    throw new Error(validation.error || 'Invalid file');
  }

  const sanitizedName =
    file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase() || 'file';
  const fileName = `${Date.now()}-${sanitizedName}${validation.extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  await execute(
    env,
    'INSERT INTO images (name, content_type, data) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET content_type = $2, data = $3',
    [fileName, file.type || 'application/octet-stream', base64Data],
  );

  return { fileName };
}

adminRoutes.post('/media/upload-file', async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  try {
    const { fileName } = await saveImageToDb(c.env, file);
    const filePath = `downloads/${fileName}`;
    return c.json({ filePath }, 201);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Upload error' }, 500);
  }
});

adminRoutes.post('/media/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  try {
    const { fileName } = await saveImageToDb(c.env, file);
    const publicUrl = `https://demonz.org/api/images/${fileName}`;
    return c.json({ url: publicUrl }, 201);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Upload error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// Backup & Restore
// ---------------------------------------------------------------------------

adminRoutes.get('/backup/export', async (c) => {
  try {
    const [projects, articles, comments, messages, studioLog, changelogs] = await Promise.all([
      query(c.env, 'SELECT * FROM projects ORDER BY updated_at DESC'),
      query(c.env, 'SELECT * FROM articles ORDER BY created_at DESC'),
      query(c.env, 'SELECT * FROM comments ORDER BY created_at DESC'),
      query(c.env, 'SELECT * FROM contact_messages ORDER BY created_at DESC'),
      query(c.env, 'SELECT * FROM studio_log ORDER BY created_at DESC'),
      query(c.env, 'SELECT * FROM changelogs ORDER BY created_at DESC'),
    ]);

    return c.json({
      version: 1,
      exported_at: new Date().toISOString(),
      projects,
      articles,
      comments,
      contact_messages: messages,
      studio_log: studioLog,
      changelogs,
    });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

adminRoutes.post('/backup/restore', async (c) => {
  const body = await c.req.json<any>();
  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Invalid backup format' }, 400);
  }

  const restoreTable = async (tx: any, table: string, rows: any[]) => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    for (const row of rows) {
      const keys = Object.keys(row).filter((k) => row[k] !== undefined);
      const values = keys.map((k) => row[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const updateSet = keys
        .filter((k) => k !== 'id')
        .map((k) => `${k} = EXCLUDED.${k}`)
        .join(', ');

      const conflictClause = updateSet
        ? `ON CONFLICT (id) DO UPDATE SET ${updateSet}`
        : 'ON CONFLICT (id) DO NOTHING';

      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) ${conflictClause}`;
      await tx.query(sql, values);
    }
  };

  try {
    await transaction(c.env, async (tx) => {
      if (body.projects) await restoreTable(tx, 'projects', body.projects);
      if (body.articles) await restoreTable(tx, 'articles', body.articles);
      if (body.comments) await restoreTable(tx, 'comments', body.comments);
      if (body.contact_messages) await restoreTable(tx, 'contact_messages', body.contact_messages);
      if (body.studio_log) await restoreTable(tx, 'studio_log', body.studio_log);
      if (body.changelogs) await restoreTable(tx, 'changelogs', body.changelogs);
    });

    return c.json({ message: 'Backup restored successfully' });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Restore error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// MCP Server Access Token (12-Hour Expiration)
// ---------------------------------------------------------------------------

adminRoutes.post('/mcp/token', async (c) => {
  const EXPIRES_IN_SECONDS = 12 * 60 * 60; // 12 hours
  const token = await signJWT({ role: 'admin', scope: 'mcp' }, c.env.JWT_SECRET, EXPIRES_IN_SECONDS);
  const expiresAt = new Date(Date.now() + EXPIRES_IN_SECONDS * 1000).toISOString();

  return c.json({
    token,
    expires_at: expiresAt,
    expires_in_hours: 12,
    server_url: 'https://dzd-api.demonzdevelopment.workers.dev/api/mcp',
  });
});

export default adminRoutes;
