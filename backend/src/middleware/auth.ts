import type { Context, Next } from 'hono';
import { verifyJWT } from '../lib/jwt';
import type { Env } from '../types';

type AuthEnv = { Bindings: Env };

export async function adminAuth(c: Context<AuthEnv>, next: Next): Promise<Response | void> {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = auth.slice(7).trim();
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const valid = await verifyJWT(token, c.env.JWT_SECRET);
  if (!valid) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
}
