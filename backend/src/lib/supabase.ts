import type { Env, SupabaseResponse } from '../types';

export interface SupabaseOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** When true, response is treated as a count-only query (no body parsed). */
  countOnly?: boolean;
}

export async function supabase<T = unknown>(
  env: Env,
  path: string,
  options: SupabaseOptions = {},
): Promise<SupabaseResponse<T> & { count?: number }> {
  const url = `${env.SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer:
        options.method === 'POST'
          ? 'return=representation'
          : options.countOnly
            ? 'count=exact'
            : 'return=minimal',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    return { data: null, error: { message: text } };
  }

  if (res.status === 204) return { data: null, error: null };

  if (options.countOnly) {
    const range = res.headers.get('content-range') ?? '0';
    const total = parseInt(range.split('/')[1] ?? '0', 10) || 0;
    return { data: null, error: null, count: total };
  }

  const data = (await res.json()) as T;
  return { data, error: null };
}
