/**
 * PostgreSQL access layer for Cloudflare Workers & Hyperdrive.
 *
 * Hyperdrive maintains the persistent connection pool to the VPS PostgreSQL
 * database at the Cloudflare edge. Worker requests use `new Client()`, connect
 * instantly via Hyperdrive, execute parameterised SQL queries, and cleanly
 * close (`client.end()`), avoiding isolate event-loop hanging.
 */

import pg from 'pg';

const { Client, Pool, types } = pg;

// Parse bigint as number
types.setTypeParser(20, (value: string) => Number(value));

// Keep UTC timestamptz/timestamp strings intact
types.setTypeParser(1184, (value: string) => value);
types.setTypeParser(1114, (value: string) => value);

export interface DbEnv {
  HYPERDRIVE?: {
    connectionString: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
  };
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

export function connectionString(env: DbEnv): string {
  if (env.HYPERDRIVE?.connectionString) return env.HYPERDRIVE.connectionString;
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const user = env.PGUSER ?? 'dzd';
  const pass = env.PGPASSWORD ?? '';
  const host = env.PGHOST ?? '127.0.0.1';
  const port = env.PGPORT ?? '5432';
  const database = env.PGDATABASE ?? 'dzd';
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${database}`;
}

/**
 * Pool instance for local testing environments where persistent connections
 * are permitted and managed.
 */
export function getPool(env: DbEnv): pg.Pool {
  const key = connectionString(env);
  if (!pool || poolKey !== key) {
    if (pool) {
      void pool.end().catch(() => {});
    }
    pool = new Pool({
      connectionString: key,
      max: Number(env.PGPOOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      statement_timeout: 15_000,
      application_name: 'dzd-api',
      ...(process.env.PGSSLMODE === 'require' ? { ssl: { rejectUnauthorized: false } } : {}),
    });
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
  const client = new Client({
    connectionString: connectionString(env),
  });
  await client.connect();
  try {
    const result = await client.query<T>(text, params);
    return result.rows;
  } finally {
    await client.end().catch(() => {});
  }
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
  const client = new Client({
    connectionString: connectionString(env),
  });
  await client.connect();
  try {
    const result = await client.query(text, params);
    return result.rowCount ?? 0;
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * Run `fn` inside a transaction, rolling back on any throw.
 */
export async function transaction<T>(
  env: DbEnv,
  fn: (tx: Queryable) => Promise<T>,
): Promise<T> {
  const client = new Client({
    connectionString: connectionString(env),
  });
  await client.connect();
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
    await client.end().catch(() => {});
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    poolKey = '';
  }
}
