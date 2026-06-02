-- Studio log: short journal entries shown on the home page.
-- These are managed from the admin panel and ordered by display_order
-- (ascending), with most recent first when display_order matches.

create table if not exists public.studio_log (
  id            uuid primary key default gen_random_uuid(),
  entry_date    text        not null,
  tag           text        not null check (tag in ('game', 'lib', 'ai', 'site', 'other')),
  title         text        not null,
  body          text        not null,
  display_order integer     not null default 0,
  published     boolean     not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists studio_log_published_order_idx
  on public.studio_log (published, display_order asc, created_at desc);

alter table public.studio_log enable row level security;
