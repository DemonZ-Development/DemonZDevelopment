/**
 * PostgreSQL access layer.
 *
 * Replaces the 49-line PostgREST wrapper this used to have. Call sites now
 * write parameterised SQL rather than a URL query string, which is both faster
 * (no string interpolation) and impossible to get wrong in the way
 * `?slug=eq.${userInput}` was.
 *
 * Every value reaching the database goes through a bind parameter. There is no
 * `query()` escape hatch exported, so SQL injection is not reachable from
 * route code by accident.
 */

import pg from 'pg';

const { Pool, types } = pg;

// node-postgres returns bigint (OID 20) as a string to avoid precision loss.
// Every bigint in this schema is a counter well inside Number.MAX_SAFE_INTEGER,
// and returning a string would silently break JSON serialisation in arithmetic
// on the client, so parse them.
types.setTypeParser(20, (value: string) => Number(value));

// timestamptz (1184) and timestamp (1114) come back as local-timezone strings.
// Keep them as-is; the schema is UTC and the API is consumed as ISO strings.
types.setTypeParser(1184, (value: string) => value);
types.setTypeParser(1114, (value: string) => value);

export interface DbEnv {
  DATABASE_URL?: string;
  PGHOST?: string;
  PGPORT?: string;
  PGDATABASE?: string;
  PGUSER?: string;
  PGPASSWORD?: string;
  PGPOOL_MAX?: string;
}

export interface Queryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number | null }>;
}

let pool: pg.Pool | null = null;
let poolKey = '';

function connectionString(env: DbEnv): string {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const user = env.PGUSER ?? 'dzd';
  const pass = env.PGPASSWORD ?? '';
  const host = env.PGHOST ?? '127.0.0.1';
  const port = env.PGPORT ?? '5432';
  const database = env.PGDATABASE ?? 'dzd';
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${database}`;
}

/**
 * One pool per unique connection string, reused across requests.
 *
 * Keyed on the string so that if DATABASE_URL ever differs between a local
 * process and a deployed one, they do not silently share a pool pointing at
 * the wrong database.
 */
export function getPool(env: DbEnv): pg.Pool {
  const key = connectionString(env);
  if (!pool || poolKey !== key) {
    if (pool) {
      // Do not leave the previous pool's sockets open.
      void pool.end().catch(() => {});
    }
    pool = new Pool({
      connectionString: key,
      max: Number(env.PGPOOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      // Fail fast rather than queue forever if the database is unreachable.
      statement_timeout: 15_000,
      application_name: 'dzd-api',
      // The VPS only accepts loopback and Cloudflare ranges, so TLS is not
      // terminated in front of it. Set PGSSLMODE=require when the database
      // sits behind a tunnel that does terminate it.
      ...(process.env.PGSSLMODE === 'require' ? { ssl: { rejectUnauthorized: false } } : {}),
    });
    // An idle client erroring out (server restart, network blip) must not take
    // the process down; the next query re-establishes.
    pool.on('error', (err) => {
      console.error('pg pool idle client error', err.message);
    });
    poolKey = key;
  }
  return pool;
}

/** Run a parameterised query and return the rows. */
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  env: DbEnv,
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool(env).query<T>(text, params);
  return result.rows;
}

/** Run a query and return the first row, or null. */
export async function queryOne<
  T extends Record<string, unknown> = Record<string, unknown>,
>(env: DbEnv, text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(env, text, params);
  return rows[0] ?? null;
}

/** Run a statement for its effect; returns the affected row count. */
export async function execute(env: DbEnv, text: string, params: unknown[] = []): Promise<number> {
  const result = await getPool(env).query(text, params);
  return result.rowCount ?? 0;
}

/**
 * Run `fn` inside a transaction, rolling back on any throw.
 *
 * Used wherever a multi-statement write must be all-or-nothing — a restore, a
 * signup that touches both users and sessions, a comment plus its moderation
 * bookkeeping.
 */
export async function transaction<T>(
  env: DbEnv,
  fn: (tx: Queryable) => Promise<T>,
): Promise<T> {
  const client = await getPool(env).connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (err) {
    try {
      await client.query('rollback');
    } catch (rollbackErr) {
      console.error('rollback failed', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    poolKey = '';
  }
}
