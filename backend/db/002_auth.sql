-- Accounts, sessions, and email-verification state.
--
-- Password hashing: PBKDF2-HMAC-SHA256 via WebCrypto in the Worker, 600k
-- iterations (OWASP's current floor for PBKDF2-SHA256). Chosen over Argon2id
-- because it needs no WASM dependency inside a Cloudflare Worker, and over
-- bcrypt because the runtime has no native bindings. Encoded as
--   pbkdf2-sha256$<iterations>$<salt_b64>$<hash_b64>
-- so the work factor can be raised later without invalidating old hashes —
-- verify against the stored iteration count and re-hash on next login.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id               uuid primary key default gen_random_uuid(),
  -- Stored lowercased and unique. citext is avoided so the Worker can do the
  -- same normalisation without depending on a Postgres extension.
  email            varchar(254) not null unique,
  username         varchar(32)  not null unique,
  display_name     varchar(64),
  password_hash    text         not null,
  role             varchar(16)  not null default 'user'
                                 check (role in ('user', 'admin')),
  bio              text,
  avatar_url       text,
  email_verified_at timestamptz,
  disabled_at      timestamptz,
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now()),

  constraint users_username_format check (username ~ '^[a-z0-9_]{3,32}$')
);

-- Case-insensitive uniqueness for email regardless of how it was typed.
create unique index if not exists users_email_lower_uniq on public.users (lower(email));

-- ---------------------------------------------------------------------------
-- back-reference: comments can now be attributed to an account
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'comments_user_id_fkey'
  ) then
    alter table public.comments
      add constraint comments_user_id_fkey
      foreign key (user_id) references public.users (id) on delete set null;
  end if;
end
$$;

create index if not exists comments_user_idx on public.comments (user_id);

-- ---------------------------------------------------------------------------
-- sessions
--
-- Only the SHA-256 of the session token is stored, so a database leak does not
-- hand out usable sessions. revoked_at gives real logout, which the previous
-- stateless-JWT admin auth did not have.
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  token_hash   bytea not null unique,
  user_agent   text,
  ip           inet,
  created_at   timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  expires_at   timestamptz not null,
  revoked_at   timestamptz
);

create index if not exists sessions_user_idx    on public.sessions (user_id);
create index if not exists sessions_expiry_idx  on public.sessions (expires_at);

-- ---------------------------------------------------------------------------
-- one-time email tokens (verification + password reset share a table)
--
-- Only a hash is stored, and only the most recent N per user are kept, so an
-- old link stops working as soon as a new one is requested.
-- ---------------------------------------------------------------------------
create table if not exists public.email_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  purpose    varchar(16) not null check (purpose in ('verify', 'reset')),
  token_hash bytea not null unique,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists email_tokens_user_idx on public.email_tokens (user_id, purpose, created_at desc);

-- ---------------------------------------------------------------------------
-- login throttling
--
-- The Worker previously kept rate-limit buckets in a per-isolate Map, which
-- resets on every deploy and is per-colo. Persisting attempts makes the limit
-- actually mean something across the edge.
-- ---------------------------------------------------------------------------
create table if not exists public.auth_attempts (
  id         bigserial primary key,
  identifier text        not null,
  kind       varchar(16) not null,
  succeeded  boolean     not null default false,
  ip         inet,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists auth_attempts_lookup_idx on public.auth_attempts (identifier, kind, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();
