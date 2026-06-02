-- Atomic download counter increment.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) to
-- allow the backend to safely increment project downloads without
-- the read-modify-write race condition.

create or replace function increment_downloads(project_slug text)
returns void
language sql
security definer
as $$
  update projects
     set downloads = coalesce(downloads, 0) + 1
   where slug = project_slug;
$$;

-- Make the function callable via PostgREST /rpc.
grant execute on function increment_downloads(text) to anon, authenticated, service_role;
