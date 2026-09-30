export interface HyperdriveBinding {
  connectionString: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export interface Env {
  HYPERDRIVE?: HyperdriveBinding;
  DATABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_KEY?: string;
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;
  MCP_SECRET?: string;
  CORS_ORIGIN: string;
  DEV?: string;
}

export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: { message: string } | null;
}
