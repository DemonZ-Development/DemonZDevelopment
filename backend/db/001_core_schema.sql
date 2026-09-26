-- DemonZ Development — core schema.
--
-- This is the authoritative schema. Historically it was created by hand in the
-- Supabase dashboard and only three incremental migrations were committed, so
-- there was no way to stand up a database from the repo alone.
--
-- Target: PostgreSQL 16+ (currently self-hosted; was Supabase).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         varchar not null unique,
  name         varchar not null,
  tagline      varchar not null,
  description  text    not null,
  category     varchar not null,
  version      varchar not null default '1.0.0',
  downloads    integer not null default 0,
  redirect_url varchar,
  file_path    varchar,
  image_url    varchar,
  source_url   varchar,
  author       varchar not null default 'DemonZ Development',
  is_featured  boolean not null default false,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

create index if not exists projects_featured_idx  on public.projects (is_featured desc);
create index if not exists projects_category_idx  on public.projects (category);
create index if not exists projects_updated_idx   on public.projects (updated_at desc);
create index if not exists projects_downloads_idx on public.projects (downloads desc);

-- ---------------------------------------------------------------------------
-- changelogs
-- ---------------------------------------------------------------------------
create table if not exists public.changelogs (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version    varchar not null,
  title      varchar not null,
  changes    text    not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists changelogs_project_idx on public.changelogs (project_id, created_at desc);
-- One entry per (project, version) so a re-save cannot duplicate a release.
create unique index if not exists changelogs_project_version_uniq
  on public.changelogs (project_id, version);

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  slug         varchar not null unique,
  title        varchar not null,
  summary      text    not null,
  content      text    not null,
  image_url    varchar,
  category     varchar,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default timezone('utc', now())
);

create index if not exists articles_published_idx on public.articles (published, published_at desc);
create index if not exists articles_category_idx  on public.articles (category);

-- ---------------------------------------------------------------------------
-- comments
--
-- parent_id makes replies possible without a second table. approved is kept
-- on the row rather than a separate moderation table so the public projection
-- stays a single filtered index scan.
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  user_id      uuid,
  parent_id    uuid references public.comments (id) on delete cascade,
  user_name    varchar not null,
  user_email   varchar not null,
  comment_text text    not null,
  approved     boolean not null default false,
  created_at   timestamptz not null default timezone('utc', now())
);

create index if not exists comments_project_idx on public.comments (project_id, approved, created_at desc);
create index if not exists comments_parent_idx  on public.comments (parent_id);

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       varchar not null,
  email      varchar not null,
  message    text    not null,
  read       boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists contact_messages_unread_idx on public.contact_messages (read, created_at desc);

-- ---------------------------------------------------------------------------
-- images
--
-- Base64-in-row was the Supabase-era workaround for having no object storage.
-- Rows here are served by GET /api/images/:name. New uploads should go to
-- object storage instead; this table is retained so existing URLs keep working.
-- ---------------------------------------------------------------------------
create table if not exists public.images (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  content_type text not null,
  data         text not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- studio_log
-- ---------------------------------------------------------------------------
create table if not exists public.studio_log (
  id            uuid primary key default gen_random_uuid(),
  entry_date    text    not null,
  tag           text    not null check (tag in ('game', 'lib', 'ai', 'site', 'other')),
  title         text    not null,
  body          text    not null,
  display_order integer not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists studio_log_published_order_idx
  on public.studio_log (published, display_order asc, created_at desc);

-- ---------------------------------------------------------------------------
-- users
--
-- Defined in 002_auth.sql. comments.user_id is a plain uuid here and gains its
-- foreign key once that table exists.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- increment_downloads
--
-- A single atomic UPDATE rather than read-modify-write, so two concurrent
-- downloads cannot clobber each other.
-- ---------------------------------------------------------------------------
create or replace function public.increment_downloads(project_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.projects
     set downloads = downloads + 1
   where slug = project_slug;
$$;

revoke all on function public.increment_downloads(text) from public;
grant execute on function public.increment_downloads(text) to dzd;
