-- Run this once in the Supabase SQL editor for project lijbxbvitmhrefmnyuys.
-- The Vercel API uses the service-role key server-side for writes.

create table if not exists public.camp_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.camp_content enable row level security;

drop policy if exists "camp_content_public_read" on public.camp_content;
create policy "camp_content_public_read"
  on public.camp_content
  for select
  using (true);
