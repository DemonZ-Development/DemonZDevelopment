-- Enable Row Level Security (RLS) on all public tables to secure them.
--
-- Since our backend API Worker uses the SUPABASE_SERVICE_KEY, it bypasses
-- RLS automatically. Direct access via the public anon key will be blocked.

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
