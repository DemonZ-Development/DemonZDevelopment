import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { supabase } from '../lib/supabase';
import { sanitize, isValidEmail } from '../lib/sanitize';
import { checkRateLimit, clientIp } from '../lib/rateLimit';
import type { Env } from '../types';

const publicRoutes = new Hono<{ Bindings: Env }>();

const cache30s = cache({ cacheName: 'dzd-cache', cacheControl: 'max-age=30' });
const cache60s = cache({ cacheName: 'dzd-cache', cacheControl: 'max-age=60' });

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

publicRoutes.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// ---------------------------------------------------------------------------
// Stats (for Home page real-stats widget)
// ---------------------------------------------------------------------------

publicRoutes.get('/stats', cache60s, async (c) => {
  const [projCount, artCount, comCount, totalDownloads, latestProject, latestArticle] =
    await Promise.all([
      supabase(c.env, 'projects?select=id', { countOnly: true }),
      supabase(c.env, 'articles?published=eq.true&select=id', { countOnly: true }),
      supabase(c.env, 'comments?approved=eq.true&select=id', { countOnly: true }),
      supabase<{ downloads: number }>(c.env, 'projects?select=downloads&limit=1000'),
      supabase<{ slug: string; name: string; tagline: string; image_url: string | null }>(
        c.env,
        'projects?select=slug,name,tagline,image_url&order=updated_at.desc&limit=1',
      ),
      supabase<{
        slug: string;
        title: string;
        summary: string;
        category: string | null;
        published_at: string | null;
      }>(
        c.env,
        'articles?published=eq.true&select=slug,title,summary,category,published_at&order=published_at.desc&limit=1',
      ),
    ]);

  const sum = Array.isArray(totalDownloads.data)
    ? totalDownloads.data.reduce((acc, p) => acc + (p.downloads ?? 0), 0)
    : 0;

  return c.json({
    projectCount: projCount.count ?? 0,
    articleCount: artCount.count ?? 0,
    commentCount: comCount.count ?? 0,
    totalDownloads: sum,
    latestProject: Array.isArray(latestProject.data) ? latestProject.data[0] ?? null : null,
    latestArticle: Array.isArray(latestArticle.data) ? latestArticle.data[0] ?? null : null,
  });
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

publicRoutes.get('/projects', cache60s, async (c) => {
  const category = c.req.query('category');
  const search = c.req.query('search');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const sort = c.req.query('sort') || 'downloads';

  let path =
    'projects?select=id,slug,name,tagline,category,version,downloads,image_url,is_featured,created_at,updated_at';

  if (category && category !== 'all') {
    path += `&category=eq.${encodeURIComponent(category)}`;
  }
  if (search) {
    path += `&or=(name.ilike.*${encodeURIComponent(search)}*,tagline.ilike.*${encodeURIComponent(search)}*,description.ilike.*${encodeURIComponent(search)}*)`;
  }

  const orderCol =
    sort === 'name'
      ? 'name.asc'
      : sort === 'updated'
        ? 'updated_at.desc'
        : 'downloads.desc';
  path += `&order=${orderCol}&limit=${limit}`;

  const { data, error } = await supabase(c.env, path);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

publicRoutes.get('/projects/:slug', cache60s, async (c) => {
  const slug = c.req.param('slug');
  const { data, error } = await supabase(
    c.env,
    `projects?slug=eq.${encodeURIComponent(slug)}&limit=1`,
    { headers: { Accept: 'application/vnd.pgrst.object+json' } },
  );
  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: 'Project not found' }, 404);
  return c.json(data);
});

// Download handler – atomic increment + redirect to file/url.
publicRoutes.get('/projects/download/:slug', async (c) => {
  const slug = c.req.param('slug');

  const { data: project } = await supabase<{
    id: string;
    redirect_url: string | null;
    file_path: string | null;
  }>(
    c.env,
    `projects?slug=eq.${encodeURIComponent(slug)}&select=id,redirect_url,file_path&limit=1`,
    { headers: { Accept: 'application/vnd.pgrst.object+json' } },
  );

  if (!project) return c.json({ error: 'Project not found' }, 404);

  // Attempt an atomic increment via a Postgres RPC. The corresponding
  // function (in supabase/migrations/) looks like:
  //
  //   create function increment_downloads(project_slug text)
  //   returns void as $$
  //     update projects set downloads = downloads + 1
  //     where slug = project_slug;
  //   $$ language sql;
  //
  // If the function isn't installed yet, fall back to read-modify-write
  // so downloads still work — just not race-safe.
  const rpcRes = await supabase(c.env, 'rpc/increment_downloads', {
    method: 'POST',
    body: { project_slug: slug },
  });
  if (rpcRes.error) {
    const { data: current } = await supabase<{ downloads: number }>(
      c.env,
      `projects?id=eq.${project.id}&select=downloads&limit=1`,
      { headers: { Accept: 'application/vnd.pgrst.object+json' } },
    );
    await supabase(c.env, `projects?id=eq.${project.id}`, {
      method: 'PATCH',
      body: { downloads: (current?.downloads ?? 0) + 1 },
    });
  }

  if (project.redirect_url) {
    return c.redirect(project.redirect_url, 302);
  }

  if (project.file_path) {
    const storageUrl = `${c.env.SUPABASE_URL}/storage/v1/object/sign/${project.file_path}`;
    const signRes = await fetch(storageUrl, {
      method: 'POST',
      headers: {
        apikey: c.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${c.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 300 }),
    });
    if (signRes.ok) {
      const signData = (await signRes.json()) as { signedURL: string };
      return c.redirect(`${c.env.SUPABASE_URL}/storage/v1${signData.signedURL}`, 302);
    }
  }

  return c.json({ error: 'No download available' }, 404);
});

// ---------------------------------------------------------------------------
// Changelogs
// ---------------------------------------------------------------------------

publicRoutes.get('/projects/:slug/changelogs', cache60s, async (c) => {
  const slug = c.req.param('slug');
  const { data: project } = await supabase<{ id: string }>(
    c.env,
    `projects?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
    { headers: { Accept: 'application/vnd.pgrst.object+json' } },
  );
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const { data, error } = await supabase(
    c.env,
    `changelogs?project_id=eq.${project.id}&order=created_at.desc`,
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

publicRoutes.get('/projects/:slug/comments', cache30s, async (c) => {
  const slug = c.req.param('slug');
  const { data: project } = await supabase<{ id: string }>(
    c.env,
    `projects?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
    { headers: { Accept: 'application/vnd.pgrst.object+json' } },
  );
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const { data, error } = await supabase(
    c.env,
    `comments?project_id=eq.${project.id}&approved=eq.true&order=created_at.desc&select=id,user_name,comment_text,created_at`,
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

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

  const { data: project } = await supabase<{ id: string }>(
    c.env,
    `projects?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
    { headers: { Accept: 'application/vnd.pgrst.object+json' } },
  );
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const { error } = await supabase(c.env, 'comments', {
    method: 'POST',
    body: {
      project_id: project.id,
      user_name: sanitize(body.user_name, 100),
      user_email: sanitize(body.user_email, 254),
      comment_text: sanitize(body.comment_text, 2000),
      approved: false,
    },
  });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Comment submitted for moderation' }, 201);
});

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

publicRoutes.get('/articles', cache60s, async (c) => {
  const category = c.req.query('category');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  let path = `articles?published=eq.true&order=published_at.desc&limit=${limit}`;
  if (category && category !== 'all') {
    path += `&category=eq.${encodeURIComponent(category)}`;
  }
  const { data, error } = await supabase(c.env, path);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

publicRoutes.get('/articles/:slug', cache60s, async (c) => {
  const slug = c.req.param('slug');
  const { data, error } = await supabase(
    c.env,
    `articles?slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`,
    { headers: { Accept: 'application/vnd.pgrst.object+json' } },
  );
  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: 'Article not found' }, 404);
  return c.json(data);
});

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

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

  const { error } = await supabase(c.env, 'contact_messages', {
    method: 'POST',
    body: {
      name: sanitize(body.name, 100),
      email: sanitize(body.email, 254),
      message: sanitize(body.message, 5000),
    },
  });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: 'Message sent successfully' }, 201);
});

// ---------------------------------------------------------------------------
// Studio log
// ---------------------------------------------------------------------------

publicRoutes.get('/studio-log', cache60s, async (c) => {
  const { data, error } = await supabase(
    c.env,
    'studio_log?select=id,entry_date,tag,title,body,display_order,created_at&published=eq.true&order=display_order.asc,created_at.desc&limit=20',
  );
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

publicRoutes.get('/search', cache60s, async (c) => {
  const q = c.req.query('q');
  if (!q || q.length < 2) return c.json({ projects: [], articles: [] });

  const [projectsRes, articlesRes] = await Promise.all([
    supabase(
      c.env,
      `projects?or=(name.ilike.*${encodeURIComponent(q)}*,tagline.ilike.*${encodeURIComponent(q)}*)&select=slug,name,tagline,category&limit=5`,
    ),
    supabase(
      c.env,
      `articles?published=eq.true&or=(title.ilike.*${encodeURIComponent(q)}*,summary.ilike.*${encodeURIComponent(q)}*)&select=slug,title,category&limit=5`,
    ),
  ]);

  return c.json({
    projects: projectsRes.data || [],
    articles: articlesRes.data || [],
  });
});

// Dynamic XML Sitemap for SEO & Search Engine / AI Crawlers
publicRoutes.get('/sitemap.xml', async (c) => {
  const [projectsRes, articlesRes] = await Promise.all([
    supabase<{ slug: string }>(c.env, 'projects?select=slug&limit=1000'),
    supabase<{ slug: string }>(c.env, 'articles?published=eq.true&select=slug&limit=1000'),
  ]);

  const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
  const articles = Array.isArray(articlesRes.data) ? articlesRes.data : [];

  const host = 'https://demonzdevelopment.online';
  
  // Base URLs
  const urls = [
    { loc: `${host}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${host}/projects`, priority: '0.9', changefreq: 'daily' },
    { loc: `${host}/articles`, priority: '0.8', changefreq: 'daily' },
    { loc: `${host}/privacy`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${host}/terms`, priority: '0.3', changefreq: 'monthly' },
  ];

  // Dynamic projects
  projects.forEach((p) => {
    urls.push({
      loc: `${host}/projects/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    });
  });

  // Dynamic articles
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
});

// ---------------------------------------------------------------------------
// Image Serving from Database
// ---------------------------------------------------------------------------

publicRoutes.get('/images/:name', async (c) => {
  const name = c.req.param('name');

  const res = await supabase<{ name: string; content_type: string; data: string }>(
    c.env,
    `images?select=name,content_type,data&name=eq.${name}`,
  );

  if (res.error || !Array.isArray(res.data) || res.data.length === 0) {
    return c.text('Image not found', 404);
  }

  const img = res.data[0];

  // Decode base64 to binary bytes
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
});

export default publicRoutes;
