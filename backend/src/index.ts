import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import mcpRoutes from './routes/mcp';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Without this, any thrown error escapes as a plaintext 500
app.onError((err, c) => {
  const isJsonSyntax = err instanceof SyntaxError;
  if (isJsonSyntax) {
    return c.json({ error: 'Malformed JSON in request body' }, 400);
  }
  console.error('unhandled error', c.req.method, c.req.path, err);
  return c.json({ error: 'Internal server error' }, 500);
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.use('*', secureHeaders());
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api/mcp')) {
    const mcpCors = cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: [
        'Content-Type',
        'Authorization',
        'x-mcp-key',
        'x-api-key',
        'mcp-session-id',
        'mcp-protocol-version',
        'accept',
      ],
      exposeHeaders: ['mcp-session-id', 'mcp-protocol-version', 'content-type'],
      maxAge: 86400,
    });
    return mcpCors(c, next);
  }

  const origins = [
    c.env?.CORS_ORIGIN,
    'https://demonz.org',
    'https://www.demonz.org',
    'https://demonz-public.pages.dev',
    'https://dzd-hq-9x2m4k.pages.dev',
  ];

  if (c.env?.DEV === 'true' || c.env?.DEV === '1') {
    origins.push('http://localhost:5173');
    origins.push('http://localhost:5174');
  }

  const uniqueOrigins = Array.from(new Set(origins.filter((o): o is string => !!o)));

  const corsMiddleware = cors({
    origin: uniqueOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

app.route('/api', publicRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/mcp', mcpRoutes);

export default app;
