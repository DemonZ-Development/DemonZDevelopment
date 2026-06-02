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
  const origins = [c.env.CORS_ORIGIN];
  if (c.env.DEV === 'true' || c.env.DEV === '1') {
    origins.push('http://localhost:5173');
  }
  const corsMiddleware = cors({
    origin: origins,
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
