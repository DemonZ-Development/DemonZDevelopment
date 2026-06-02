import { Hono } from 'hono';
import { cors } from 'hono/cors';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

app.use('*', async (c, next) => {
  const origins = [
    c.env.CORS_ORIGIN,
    'https://demonzdevelopment.online',
    'https://demonz-public.pages.dev',
    'https://demonz-admin.pages.dev'
  ];

  if (c.env.DEV === 'true' || c.env.DEV === '1') {
    origins.push('http://localhost:5173');
    origins.push('http://localhost:5174');
  }

  // Filter out duplicate or empty values
  const uniqueOrigins = Array.from(new Set(origins.filter((o): o is string => !!o)));

  const corsMiddleware = cors({
    origin: uniqueOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.route('/api', publicRoutes);
app.route('/api/admin', adminRoutes);

// Catch-all 404
app.all('*', (c) => c.json({ error: 'Not found' }, 404));

export default app;
