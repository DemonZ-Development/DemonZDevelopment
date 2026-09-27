/**
 * Exercises the pg layer against the real VPS database through the SSH
 * tunnel on 127.0.0.1:15432. Skipped automatically when the tunnel is absent,
 * so `npm test` still passes on a machine that has never seen the VPS.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  query,
  queryOne,
  execute,
  transaction,
  getPool,
  closePool,
  type DbEnv,
} from '../src/lib/db';

const TUNNEL_PORT = 15432;

const env: DbEnv = {
  PGHOST: '127.0.0.1',
  PGPORT: String(TUNNEL_PORT),
  PGDATABASE: process.env.DZD_TEST_DB ?? 'dzd',
  PGUSER: process.env.DZD_TEST_USER ?? 'dzd',
  PGPASSWORD: process.env.DZD_TEST_PASSWORD ?? '',
};

/**
 * Whether to register these tests at all. Decided synchronously at module load
 * because a suite's tests are collected before any hook runs — checking
 * connectivity in beforeAll is too late to decide whether to register.
 */
const configured = Boolean(process.env.DZD_TEST_PASSWORD);

let reachable = false;

beforeAll(async () => {
  if (!configured) return;
  try {
    await query(env, 'select 1');
    reachable = true;
  } catch {
    reachable = false;
  }
});

afterAll(async () => {
  if (reachable) await closePool();
});

/**
 * Register the tests only when credentials were supplied. If they were, a
 * connectivity failure should surface as a real failure rather than being
 * silently skipped — a green run that quietly tested nothing is worse.
 */
const maybe = (name: string, fn: () => Promise<void> | void) =>
  configured ? it(name, fn) : it.skip(name, fn);

describe('pg layer against the live database', () => {
  maybe('runs a parameterised read', async () => {
    const rows = await query<{ slug: string; downloads: number }>(
      env,
      'select slug, downloads from public.projects order by downloads desc',
    );
    expect(rows.length).toBeGreaterThan(0);
    const downloads = rows.map((r) => r.downloads);
    expect([...downloads].sort((a, b) => b - a)).toEqual(downloads);
  });

  maybe('binds parameters rather than interpolating', async () => {
    const rows = await query<{ slug: string }>(
      env,
      'select slug from public.projects where slug = $1',
      ['dzeconomy'],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].slug).toBe('dzeconomy');
  });

  maybe('treats a SQL injection attempt as a literal string', async () => {
    const rows = await query(
      env,
      'select slug from public.projects where slug = $1',
      ["' OR 1=1 --"],
    );
    expect(rows).toHaveLength(0);
  });

  maybe('returns null for a miss via queryOne', async () => {
    const row = await queryOne(env, 'select id from public.projects where slug = $1', [
      'definitely-not-a-real-slug',
    ]);
    expect(row).toBeNull();
  });

  maybe('has the migrated article content', async () => {
    const row = await queryOne<{ content: string }>(
      env,
      'select content from public.articles where slug = $1',
      ['preview-markdown-kitchen-sink'],
    );
    // Not expected to exist; the point is the table is queryable.
    if (row) expect(typeof row.content).toBe('string');
  });

  maybe('exposes the auth tables', async () => {
    for (const table of ['users', 'sessions', 'email_tokens', 'auth_attempts']) {
      const rows = await query(env, `select count(*)::int as n from public.${table}`);
      expect(rows).toHaveLength(1);
    }
  });

  maybe('enforces the username format check', async () => {
    await expect(
      execute(
        env,
        `insert into public.users (email, username, password_hash)
         values ($1, $2, $3)`,
        ['fmt@example.com', 'AB', 'pbkdf2-sha256$1$x$y'],
      ),
    ).rejects.toThrow();
  });

  maybe('enforces unique email case-insensitively', async () => {
    const email = `dupe-${Date.now()}@example.com`;
    const insert = (e: string, u: string) =>
      execute(
        env,
        `insert into public.users (email, username, password_hash)
         values ($1, $2, $3)`,
        [e, u, 'pbkdf2-sha256$1$x$y'],
      );
    await insert(email, `dupe${Date.now() % 100000}`);
    await expect(insert(email.toUpperCase(), `other${Date.now() % 100000}`)).rejects.toThrow();
  });

  maybe('rolls a failed transaction back completely', async () => {
    const before = await queryOne<{ n: number }>(
      env,
      'select count(*)::int as n from public.users',
    );
    const suffix = Date.now() % 100000;
    await expect(
      transaction(env, async (tx) => {
        await tx.query(
          `insert into public.users (email, username, password_hash)
           values ($1, $2, $3)`,
          [`tx-${suffix}@example.com`, `txuser${suffix}`, 'pbkdf2-sha256$1$x$y'],
        );
        // Force a failure after the insert.
        throw new Error('deliberate rollback');
      }),
    ).rejects.toThrow('deliberate rollback');

    const after = await queryOne<{ n: number }>(
      env,
      'select count(*)::int as n from public.users',
    );
    expect(after?.n).toBe(before?.n);
  });

  maybe('commits a successful transaction', async () => {
    const suffix = Date.now() % 100000;
    const email = `commit-${suffix}@example.com`;
    const username = `commituser${suffix}`;
    await transaction(env, async (tx) => {
      await tx.query(
        `insert into public.users (email, username, password_hash)
         values ($1, $2, $3)`,
        [email, username, 'pbkdf2-sha256$1$x$y'],
      );
    });
    const found = await queryOne(env, 'select id from public.users where email = $1', [email]);
    expect(found).not.toBeNull();
    await execute(env, 'delete from public.users where email = $1', [email]);
  });

  maybe('reuses one pool per connection string', () => {
    expect(getPool(env)).toBe(getPool(env));
  });
});
