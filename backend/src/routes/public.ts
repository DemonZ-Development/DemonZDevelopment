import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { query, queryOne, execute } from '../lib/db';
import { sanitize, isValidEmail } from '../lib/sanitize';
import { validateContentType, sanitizeNameParam } from '../lib/mediaValidation';
import { checkRateLimit, clientIp } from '../lib/rateLimit';
import type { Env } from '../types';

const publicRoutes = new Hono<{ Bindings: Env }>();

const cache30s = cache({ cacheName: 'dzd-cache', cacheControl: 'max-age=30' });
const cache60s = cache({ cacheName: 'dzd-cache', cacheControl: 'max-age=60' });
const cache7Days = cache({ cacheName: 'dzd-images', cacheControl: 'public, max-age=604800, must-revalidate' });

// Health check
publicRoutes.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// Site statistics
publicRoutes.get('/stats', cache60s, async (c) => {
  try {
    const [stats, latestProj, latestArt] = await Promise.all([
      queryOne<{
        project_count: number;
        article_count: number;
        comment_count: number;
        total_downloads: number;
      }>(
        c.env,
        `SELECT
          (SELECT count(*)::int FROM projects) as project_count,
          (SELECT count(*)::int FROM articles WHERE published = true) as article_count,
          (SELECT count(*)::int FROM comments WHERE approved = true) as comment_count,
          (SELECT COALESCE(sum(downloads), 0)::int FROM projects) as total_downloads`,
      ),
      queryOne<{ slug: string; name: string; tagline: string; image_url: string | null }>(
        c.env,
        'SELECT slug, name, tagline, image_url FROM projects ORDER BY updated_at DESC LIMIT 1',
      ),
      queryOne<{
        slug: string;
        title: string;
        summary: string;
        category: string | null;
        published_at: string | null;
      }>(
        c.env,
        'SELECT slug, title, summary, category, published_at FROM articles WHERE published = true ORDER BY published_at DESC LIMIT 1',
      ),
    ]);

    return c.json({
      projectCount: stats?.project_count ?? 0,
      articleCount: stats?.article_count ?? 0,
      commentCount: stats?.comment_count ?? 0,
      totalDownloads: stats?.total_downloads ?? 0,
      latestProject: latestProj ?? null,
      latestArticle: latestArt ?? null,
    });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// List projects
publicRoutes.get('/projects', cache60s, async (c) => {
  const category = c.req.query('category');
  const search = c.req.query('search');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const sort = c.req.query('sort') || 'downloads';

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category && category !== 'all') {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    conditions.push(`(name ILIKE $${idx} OR tagline ILIKE $${idx} OR description ILIKE $${idx})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderClause = 'ORDER BY downloads DESC';
  if (sort === 'name') orderClause = 'ORDER BY name ASC';
  else if (sort === 'updated') orderClause = 'ORDER BY updated_at DESC';

  params.push(limit);
  const limitIdx = params.length;

  const sql = `SELECT id, slug, name, tagline, category, version, downloads, image_url, is_featured, created_at, updated_at
               FROM projects ${whereClause} ${orderClause} LIMIT $${limitIdx}`;

  try {
    const projects = await query(c.env, sql, params);
    return c.json(projects);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Single project by slug
publicRoutes.get('/projects/:slug', cache60s, async (c) => {
  const slug = c.req.param('slug');
  try {
    const project = await queryOne(c.env, 'SELECT * FROM projects WHERE slug = $1 LIMIT 1', [slug]);
    if (!project) return c.json({ error: 'Project not found' }, 404);
    return c.json(project);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Per-project update check for client apps/launchers
publicRoutes.get('/projects/:slug/updates', async (c) => {
  const slug = c.req.param('slug');
  const currentVersion = c.req.query('current_version') || c.req.query('version');

  try {
    const project = await queryOne<{
      id: string;
      slug: string;
      name: string;
      version: string | null;
      redirect_url: string | null;
      file_path: string | null;
      updated_at: string;
    }>(
      c.env,
      'SELECT id, slug, name, version, redirect_url, file_path, updated_at FROM projects WHERE slug = $1 LIMIT 1',
      [slug],
    );
    if (!project) return c.json({ error: 'Project not found' }, 404);

    const latestVersion = project.version || '1.0.0';
    const hasUpdate = currentVersion ? currentVersion !== latestVersion : true;

    const changelogs = await query<{
      version: string;
      title: string;
      changes: string;
      release_date: string;
    }>(
      c.env,
      'SELECT version, title, changes, created_at as release_date FROM changelogs WHERE project_id = $1 ORDER BY created_at DESC LIMIT 5',
      [project.id],
    );

    return c.json({
      project: project.name,
      slug: project.slug,
      current_version: currentVersion ?? null,
      latest_version: latestVersion,
      has_update: hasUpdate,
      release_date: project.updated_at,
      download_url: `https://demonz.org/api/projects/download/${project.slug}`,
      changelog: changelogs,
    });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Project download and atomic counter increment
publicRoutes.get('/projects/download/:slug', async (c) => {
  const slug = c.req.param('slug');
  try {
    const project = await queryOne<{
      id: string;
      redirect_url: string | null;
      file_path: string | null;
    }>(
      c.env,
      'UPDATE projects SET downloads = downloads + 1 WHERE slug = $1 RETURNING id, redirect_url, file_path',
      [slug],
    );

    if (!project) return c.json({ error: 'Project not found' }, 404);

    if (project.redirect_url) {
      return c.redirect(project.redirect_url, 302);
    }

    if (project.file_path) {
      return c.redirect(`/api/images/${project.file_path}`, 302);
    }

    return c.json({ error: 'No download available' }, 404);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Project changelogs
publicRoutes.get('/projects/:slug/changelogs', cache60s, async (c) => {
  const slug = c.req.param('slug');
  try {
    const changelogs = await query(
      c.env,
      `SELECT c.id, c.version, c.title, c.changes, c.created_at as release_date, c.created_at
       FROM changelogs c
       JOIN projects p ON c.project_id = p.id
       WHERE p.slug = $1
       ORDER BY c.created_at DESC`,
      [slug],
    );
    return c.json(changelogs);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Project comments
publicRoutes.get('/projects/:slug/comments', cache30s, async (c) => {
  const slug = c.req.param('slug');
  try {
    const comments = await query(
      c.env,
      `SELECT c.id, c.user_name, c.comment_text, c.created_at
       FROM comments c
       JOIN projects p ON c.project_id = p.id
       WHERE p.slug = $1 AND c.approved = true
       ORDER BY c.created_at DESC`,
      [slug],
    );
    return c.json(comments);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Submit project comment
publicRoutes.post('/projects/:slug/comments', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json<{
    user_name: string;
    user_email: string;
    comment_text: string;
  }>();

  if (!body.user_name || !body.user_email || !body.comment_text) {
    return c.json({ error: 'All fields are required' }, 400);
  }
  if (!isValidEmail(body.user_email)) {
    return c.json({ error: 'Invalid email address' }, 400);
  }

  const ip = clientIp(c.req.raw);
  const limit = checkRateLimit(`comment:${ip}`, { capacity: 5, refillRate: 1 / 60 });
  if (!limit.allowed) {
    return c.json(
      { error: 'Too many comments from your IP. Try again later.' },
      429,
    );
  }

  try {
    const project = await queryOne<{ id: string }>(
      c.env,
      'SELECT id FROM projects WHERE slug = $1 LIMIT 1',
      [slug],
    );
    if (!project) return c.json({ error: 'Project not found' }, 404);

    await execute(
      c.env,
      `INSERT INTO comments (project_id, user_name, user_email, comment_text, approved)
       VALUES ($1, $2, $3, $4, false)`,
      [
        project.id,
        sanitize(body.user_name, 100),
        sanitize(body.user_email, 254),
        sanitize(body.comment_text, 2000),
      ],
    );

    return c.json({ message: 'Comment submitted for moderation' }, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// List articles
publicRoutes.get('/articles', async (c) => {
  const category = c.req.query('category');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const params: unknown[] = [];
  const conditions = ['published = true'];

  if (category && category !== 'all') {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  params.push(limit);
  const limitIdx = params.length;

  try {
    const articles = await query(
      c.env,
      `SELECT id, slug, title, summary, category, published_at, created_at
       FROM articles
       WHERE ${conditions.join(' AND ')}
       ORDER BY published_at DESC
       LIMIT $${limitIdx}`,
      params,
    );
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return c.json(articles);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Single article by slug
publicRoutes.get('/articles/:slug', async (c) => {
  const slug = c.req.param('slug');
  try {
    const article = await queryOne(
      c.env,
      'SELECT * FROM articles WHERE slug = $1 AND published = true LIMIT 1',
      [slug],
    );
    if (!article) return c.json({ error: 'Article not found' }, 404);
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return c.json(article);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Submit contact message
publicRoutes.post('/contact', async (c) => {
  const body = await c.req.json<{ name: string; email: string; message: string }>();

  if (!body.name || !body.email || !body.message) {
    return c.json({ error: 'All fields are required' }, 400);
  }
  if (!isValidEmail(body.email)) {
    return c.json({ error: 'Invalid email address' }, 400);
  }

  const ip = clientIp(c.req.raw);
  const limit = checkRateLimit(`contact:${ip}`, { capacity: 3, refillRate: 1 / 120 });
  if (!limit.allowed) {
    return c.json(
      { error: 'Too many contact submissions from your IP. Try again later.' },
      429,
    );
  }

  try {
    await execute(
      c.env,
      'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
      [
        sanitize(body.name, 100),
        sanitize(body.email, 254),
        sanitize(body.message, 5000),
      ],
    );
    return c.json({ message: 'Message sent successfully' }, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Studio development log entries
publicRoutes.get('/studio-log', cache60s, async (c) => {
  try {
    const logs = await query(
      c.env,
      `SELECT id, entry_date, tag, title, body, display_order, created_at
       FROM studio_log
       WHERE published = true
       ORDER BY display_order ASC, created_at DESC
       LIMIT 20`,
    );
    return c.json(logs);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// Global search
publicRoutes.get('/search', cache60s, async (c) => {
  const q = c.req.query('q');
  if (!q || q.length < 2) return c.json({ projects: [], articles: [] });

  const pattern = `%${q}%`;
  try {
    const [projects, articles] = await Promise.all([
      query(
        c.env,
        `SELECT slug, name, tagline, category
         FROM projects
         WHERE name ILIKE $1 OR tagline ILIKE $1
         LIMIT 5`,
        [pattern],
      ),
      query(
        c.env,
        `SELECT slug, title, category
         FROM articles
         WHERE published = true AND (title ILIKE $1 OR summary ILIKE $1)
         LIMIT 5`,
        [pattern],
      ),
    ]);

    return c.json({
      projects: projects || [],
      articles: articles || [],
    });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// RSS Feed
publicRoutes.get('/feed.xml', async (c) => {
  try {
    const articles = await query<{
      slug: string;
      title: string;
      summary: string;
      content: string;
      category: string | null;
      published_at: string | null;
      created_at: string;
    }>(
      c.env,
      `SELECT slug, title, summary, content, category, published_at, created_at
       FROM articles
       WHERE published = true
       ORDER BY published_at DESC
       LIMIT 30`,
    );

    const host = 'https://demonz.org';
    const escapeXml = (s: string) =>
      (s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const entries = articles
      .map((a) => {
        const date = a.published_at || a.created_at;
        const link = `${host}/articles/${a.slug}`;
        return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      ${a.category ? `<category>${escapeXml(a.category)}</category>` : ''}
      <description>${escapeXml(a.summary || a.content.slice(0, 300))}</description>
    </item>`;
      })
      .join('\n');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DemonZ Development — Articles</title>
    <link>${host}/articles</link>
    <description>Tutorials, announcements, and insights from the DemonZ Development team.</description>
    <language>en-us</language>
    <atom:link href="${host}/api/feed.xml" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>`;

    return c.text(feed, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    });
  } catch (err) {
    return c.text('Error generating feed', 500);
  }
});

// Dynamic XML Sitemap for SEO & Search Engine Crawlers
publicRoutes.get('/sitemap.xml', async (c) => {
  try {
    const [projects, articles] = await Promise.all([
      query<{ slug: string }>(c.env, 'SELECT slug FROM projects LIMIT 1000'),
      query<{ slug: string }>(c.env, 'SELECT slug FROM articles WHERE published = true LIMIT 1000'),
    ]);

    const host = 'https://demonz.org';

    const urls = [
      { loc: `${host}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${host}/projects`, priority: '0.9', changefreq: 'daily' },
      { loc: `${host}/articles`, priority: '0.8', changefreq: 'daily' },
      { loc: `${host}/privacy`, priority: '0.3', changefreq: 'monthly' },
      { loc: `${host}/terms`, priority: '0.3', changefreq: 'monthly' },
    ];

    projects.forEach((p) => {
      urls.push({
        loc: `${host}/projects/${p.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
      });
    });

    articles.forEach((a) => {
      urls.push({
        loc: `${host}/articles/${a.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
      });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

    return c.text(xml, 200, {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (err) {
    return c.text('Error generating sitemap', 500);
  }
});

// Image Serving from Database
publicRoutes.get('/images/:name', cache7Days, async (c) => {
  const rawName = c.req.param('name');
  const name = sanitizeNameParam(rawName);
  if (!name) {
    return c.text('Image not found', 404);
  }

  try {
    const img = await queryOne<{ name: string; content_type: string; data: string }>(
      c.env,
      'SELECT name, content_type, data FROM images WHERE name = $1 LIMIT 1',
      [name],
    );

    if (!img) {
      return c.text('Image not found', 404);
    }

    if (!validateContentType(img.content_type)) {
      return c.text('Unsupported content type', 415);
    }

    const binaryString = atob(img.data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return c.body(bytes, 200, {
      'Content-Type': img.content_type,
      'Cache-Control': 'public, max-age=604800, must-revalidate',
    });
  } catch (err) {
    return c.text('Image not found', 404);
  }
});

export default publicRoutes;
