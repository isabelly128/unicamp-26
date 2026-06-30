-- Run this once in the Supabase SQL editor for project lijbxbvitmhrefmnyuys.
-- The React app reads directly with the publishable/anon key.
-- Writes require a Supabase Auth user whose email is allowlisted below.

create table if not exists public.camp_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.camp_content enable row level security;

grant select on public.camp_content to anon, authenticated;
grant insert, update on public.camp_content to authenticated;

drop policy if exists "camp_content_public_read" on public.camp_content;
create policy "camp_content_public_read"
  on public.camp_content
  for select
  using (true);

drop policy if exists "camp_content_staff_insert" on public.camp_content;
create policy "camp_content_staff_insert"
  on public.camp_content
  for insert
  to authenticated
  with check (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'comms@camp.sg')
  );

drop policy if exists "camp_content_staff_update" on public.camp_content;
create policy "camp_content_staff_update"
  on public.camp_content
  for update
  to authenticated
  using (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'comms@camp.sg')
  )
  with check (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'comms@camp.sg')
  );

-- Keep the shared camp content row compatible with the latest booklet JSON shape.
-- Existing values are preserved; missing keys are initialized for persistent storage.
insert into public.camp_content (id, content, updated_by)
values (
  'unicamp-2026',
  jsonb_build_object(
    'busRows', '[]'::jsonb,
    'prayerRooms', '[]'::jsonb,
    'medicText', ''
  ),
  'setup'
)
on conflict (id) do update
set content = camp_content.content || jsonb_build_object(
  'busRows', coalesce(camp_content.content -> 'busRows', '[]'::jsonb),
  'prayerRooms', coalesce(camp_content.content -> 'prayerRooms', '[]'::jsonb),
  'medicText', coalesce(camp_content.content -> 'medicText', to_jsonb(''::text))
);
