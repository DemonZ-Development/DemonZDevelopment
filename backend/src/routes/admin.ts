import { Hono } from 'hono';
import { supabase } from '../lib/supabase';
import { signJWT } from '../lib/jwt';
import { sha256Hex, timingSafeEqual } from '../lib/crypto';
import { checkRateLimit, clientIp } from '../lib/rateLimit';
import { adminAuth } from '../middleware/auth';
import type { Env } from '../types';

const adminRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Login
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

// ---------------------------------------------------------------------------
// Authenticated routes
// ---------------------------------------------------------------------------

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

// Projects CRUD
adminRoutes.get('/projects', async (c) => {
  const { data, error } = await supabase(
    c.env,
    'projects?select=*&order=updated_at.desc',
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

adminRoutes.post('/projects', async (c) => {
  const body = await c.req.json();
  const { data, error } = await supabase(c.env, 'projects', { method: 'POST', body });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

adminRoutes.put('/projects/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  body.updated_at = new Date().toISOString();
  const { error } = await supabase(c.env, `projects?id=eq.${id}`, {
    method: 'PATCH',
    body,
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Updated' });
});

adminRoutes.delete('/projects/:id', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `projects?id=eq.${id}`, {
    method: 'DELETE',
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Deleted' });
});

// Articles CRUD (returns both published + drafts)
adminRoutes.get('/articles', async (c) => {
  const { data, error } = await supabase(
    c.env,
    'articles?select=id,slug,title,category,published,published_at,created_at&order=created_at.desc',
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

adminRoutes.post('/articles', async (c) => {
  const body = await c.req.json();
  if (body.published) body.published_at = new Date().toISOString();
  const { data, error } = await supabase(c.env, 'articles', { method: 'POST', body });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

adminRoutes.put('/articles/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  if (body.published && !body.published_at) {
    body.published_at = new Date().toISOString();
  }
  const { error } = await supabase(c.env, `articles?id=eq.${id}`, {
    method: 'PATCH',
    body,
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Updated' });
});

adminRoutes.delete('/articles/:id', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `articles?id=eq.${id}`, {
    method: 'DELETE',
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Deleted' });
});

// Changelogs CRUD
adminRoutes.post('/changelogs', async (c) => {
  const body = await c.req.json();
  const { data, error } = await supabase(c.env, 'changelogs', {
    method: 'POST',
    body,
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

adminRoutes.delete('/changelogs/:id', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `changelogs?id=eq.${id}`, {
    method: 'DELETE',
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Deleted' });
});

// Comments moderation
adminRoutes.get('/comments', async (c) => {
  const { data, error } = await supabase(
    c.env,
    'comments?select=id,user_name,user_email,comment_text,approved,created_at&order=created_at.desc',
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

adminRoutes.put('/comments/:id/approve', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `comments?id=eq.${id}`, {
    method: 'PATCH',
    body: { approved: true },
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Approved' });
});

adminRoutes.delete('/comments/:id', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `comments?id=eq.${id}`, {
    method: 'DELETE',
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Deleted' });
});

// Contact messages
adminRoutes.get('/messages', async (c) => {
  const { data, error } = await supabase(
    c.env,
    'contact_messages?select=id,name,email,message,read,created_at&order=created_at.desc',
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

adminRoutes.put('/messages/:id/read', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `contact_messages?id=eq.${id}`, {
    method: 'PATCH',
    body: { read: true },
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Marked as read' });
});

adminRoutes.delete('/messages/:id', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `contact_messages?id=eq.${id}`, {
    method: 'DELETE',
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Deleted' });
});

// Studio log CRUD
adminRoutes.get('/studio-log', async (c) => {
  const { data, error } = await supabase(
    c.env,
    'studio_log?select=id,entry_date,tag,title,body,display_order,published,created_at&order=display_order.asc,created_at.desc',
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

adminRoutes.post('/studio-log', async (c) => {
  const body = await c.req.json();
  const { data, error } = await supabase(c.env, 'studio_log', {
    method: 'POST',
    body,
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

adminRoutes.put('/studio-log/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { error } = await supabase(c.env, `studio_log?id=eq.${id}`, {
    method: 'PATCH',
    body,
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Updated' });
});

adminRoutes.delete('/studio-log/:id', async (c) => {
  const id = c.req.param('id');
  const { error } = await supabase(c.env, `studio_log?id=eq.${id}`, {
    method: 'DELETE',
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Deleted' });
});

// File upload (ZIPs, JARs, builds, etc.)
adminRoutes.post('/media/upload-file', async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  const extension = file.name.split('.').pop() || 'zip';
  const sanitizedName = file.name
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
  const fileName = `${Date.now()}-${sanitizedName}.${extension}`;

  const uploadUrl = `${c.env.SUPABASE_URL}/storage/v1/object/downloads/${fileName}`;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: c.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${c.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: arrayBuffer,
    });

    if (!res.ok) {
      const errMsg = await res.text();
      return c.json({ error: `Storage upload failed: ${errMsg}` }, 500);
    }

    const filePath = `downloads/${fileName}`;
    return c.json({ filePath }, 201);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Upload error' }, 500);
  }
});

// Media upload
adminRoutes.post('/media/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  const extension = file.name.split('.').pop() || 'png';
  const sanitizedName = file.name
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
  const fileName = `${Date.now()}-${sanitizedName}.${extension}`;

  const uploadUrl = `${c.env.SUPABASE_URL}/storage/v1/object/media/${fileName}`;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: c.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${c.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: arrayBuffer,
    });

    if (!res.ok) {
      const errMsg = await res.text();
      return c.json({ error: `Storage upload failed: ${errMsg}` }, 500);
    }

    const publicUrl = `${c.env.SUPABASE_URL}/storage/v1/object/public/media/${fileName}`;
    return c.json({ url: publicUrl }, 201);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Upload error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// Backup & Restore
// ---------------------------------------------------------------------------

adminRoutes.get('/backup/export', async (c) => {
  const [projects, articles, comments, messages, studioLog, changelogs] = await Promise.all([
    supabase(c.env, 'projects?select=*'),
    supabase(c.env, 'articles?select=*'),
    supabase(c.env, 'comments?select=*'),
    supabase(c.env, 'contact_messages?select=*'),
    supabase(c.env, 'studio_log?select=*'),
    supabase(c.env, 'changelogs?select=*'),
  ]);

  if (projects.error) return c.json({ error: `projects: ${projects.error.message}` }, 500);
  if (articles.error) return c.json({ error: `articles: ${articles.error.message}` }, 500);
  if (comments.error) return c.json({ error: `comments: ${comments.error.message}` }, 500);
  if (messages.error) return c.json({ error: `messages: ${messages.error.message}` }, 500);
  if (studioLog.error) return c.json({ error: `studioLog: ${studioLog.error.message}` }, 500);
  if (changelogs.error) return c.json({ error: `changelogs: ${changelogs.error.message}` }, 500);

  return c.json({
    version: 1,
    exported_at: new Date().toISOString(),
    projects: projects.data,
    articles: articles.data,
    comments: comments.data,
    contact_messages: messages.data,
    studio_log: studioLog.data,
    changelogs: changelogs.data,
  });
});

adminRoutes.post('/backup/restore', async (c) => {
  const body = await c.req.json<any>();
  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Invalid backup format' }, 400);
  }

  const restoreTable = async (table: string, data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) return;
    const { error } = await supabase(c.env, `${table}?on_conflict=id`, {
      method: 'POST',
      body: data,
      headers: {
        'Prefer': 'resolution=merge-duplicates',
      },
    });
    if (error) {
      throw new Error(`Failed to restore ${table}: ${error.message}`);
    }
  };

  try {
    if (body.projects) await restoreTable('projects', body.projects);
    if (body.articles) await restoreTable('articles', body.articles);
    if (body.comments) await restoreTable('comments', body.comments);
    if (body.contact_messages) await restoreTable('contact_messages', body.contact_messages);
    if (body.studio_log) await restoreTable('studio_log', body.studio_log);
    if (body.changelogs) await restoreTable('changelogs', body.changelogs);

    return c.json({ message: 'Backup restored successfully' });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Restore error' }, 500);
  }
});

export default adminRoutes;
