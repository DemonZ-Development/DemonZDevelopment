import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
  try {
    const t = Date.now();
    const [projectsRes, articlesRes] = await Promise.all([
      fetch(`https://dzd-api.demonzdevelopment.workers.dev/api/projects?t=${t}`).then((r) => r.json()),
      fetch(`https://dzd-api.demonzdevelopment.workers.dev/api/articles?t=${t}`).then((r) => r.json())
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
