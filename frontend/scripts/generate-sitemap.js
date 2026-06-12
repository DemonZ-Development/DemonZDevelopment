import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load env vars from backend/.dev.vars
function loadEnvVars() {
  const env = {};
  try {
    const varsPath = path.join(__dirname, '../../backend/.dev.vars');
    if (fs.existsSync(varsPath)) {
      const content = fs.readFileSync(varsPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.strip ? line.strip() : line.trim();
        if (trimmed && trimmed.includes('=')) {
          const [key, val] = trimmed.split('=', 2);
          env[key.trim()] = val.trim();
        }
      });
    }
  } catch (err) {
    console.warn('Could not load local .dev.vars, falling back to process env:', err.message);
  }
  return env;
}

async function generate() {
  try {
    const localEnv = loadEnvVars();
    const supabaseUrl = process.env.SUPABASE_URL || localEnv.SUPABASE_URL || 'https://ottnwduaqyyqttfpwqsy.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || localEnv.SUPABASE_SERVICE_KEY;

    if (!supabaseKey) {
      throw new Error('Supabase key not found in environment or .dev.vars');
    }

    console.log('Fetching slugs from Supabase REST API:', supabaseUrl);

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    };

    const [projectsRes, articlesRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/projects?select=slug`, { headers }).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch projects: ${r.statusText}`);
        return r.json();
      }),
      fetch(`${supabaseUrl}/rest/v1/articles?published=eq.true&select=slug`, { headers }).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch articles: ${r.statusText}`);
        return r.json();
      })
    ]);

    const host = 'https://demonzdevelopment.online';
    const urls = [
      { loc: `${host}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${host}/projects`, priority: '0.9', changefreq: 'daily' },
      { loc: `${host}/articles`, priority: '0.8', changefreq: 'daily' },
      { loc: `${host}/privacy`, priority: '0.3', changefreq: 'monthly' },
      { loc: `${host}/terms`, priority: '0.3', changefreq: 'monthly' },
    ];

    if (Array.isArray(projectsRes)) {
      projectsRes.forEach((p) => {
        urls.push({
          loc: `${host}/projects/${p.slug}`,
          priority: '0.8',
          changefreq: 'weekly',
        });
      });
    }

    if (Array.isArray(articlesRes)) {
      articlesRes.forEach((a) => {
        urls.push({
          loc: `${host}/articles/${a.slug}`,
          priority: '0.8',
          changefreq: 'weekly',
        });
      });
    }

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

    const destPath = path.join(__dirname, '../public/sitemap.xml');
    const backupPath = path.join(__dirname, '../public/sitemap-main.xml');
    fs.writeFileSync(destPath, xml, 'utf8');
    fs.writeFileSync(backupPath, xml, 'utf8');
    console.log('Sitemap generated successfully at:', destPath, 'and', backupPath);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    process.exit(1);
  }
}

generate();
