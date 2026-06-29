-- Run this once in the Supabase SQL editor for project lijbxbvitmhrefmnyuys.
-- It stores prayer wall and testimony submissions outside the shared camp_content row.
-- Public visitors may submit content. Staff users moderate/read sensitive entries through RLS.

create extension if not exists pgcrypto;

create table if not exists public.community_prayer_requests (
  id text primary key default gen_random_uuid()::text,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  name text check (name is null or char_length(trim(name)) between 1 and 120),
  submitted_by text not null default 'member-public',
  submitted_at timestamptz not null default now(),
  is_anonymous boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'prayed'))
);

alter table public.community_prayer_requests
  add column if not exists name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_prayer_requests_name_length'
  ) then
    alter table public.community_prayer_requests
      add constraint community_prayer_requests_name_length
      check (name is null or char_length(trim(name)) between 1 and 120);
  end if;
end $$;

create table if not exists public.community_convictions (
  id text primary key default gen_random_uuid()::text,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  name text check (name is null or char_length(trim(name)) between 1 and 120),
  submitted_at timestamptz not null default now(),
  approved boolean not null default false,
  approved_by text
);

alter table public.community_convictions
  add column if not exists name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_convictions_name_length'
  ) then
    alter table public.community_convictions
      add constraint community_convictions_name_length
      check (name is null or char_length(trim(name)) between 1 and 120);
  end if;
end $$;

create table if not exists public.community_thanksgivings (
  id text primary key default gen_random_uuid()::text,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  name text check (name is null or char_length(trim(name)) between 1 and 120),
  submitted_by text not null default 'member-public',
  submitted_at timestamptz not null default now(),
  is_anonymous boolean not null default true
);

alter table public.community_thanksgivings
  add column if not exists name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_thanksgivings_name_length'
  ) then
    alter table public.community_thanksgivings
      add constraint community_thanksgivings_name_length
      check (name is null or char_length(trim(name)) between 1 and 120);
  end if;
end $$;

create index if not exists community_prayer_requests_submitted_at_idx
  on public.community_prayer_requests (submitted_at desc);
create index if not exists community_prayer_requests_status_idx
  on public.community_prayer_requests (status);
create index if not exists community_convictions_approved_submitted_at_idx
  on public.community_convictions (approved, submitted_at desc);
create index if not exists community_thanksgivings_submitted_at_idx
  on public.community_thanksgivings (submitted_at desc);

alter table public.community_prayer_requests enable row level security;
alter table public.community_convictions enable row level security;
alter table public.community_thanksgivings enable row level security;

grant select, insert on public.community_prayer_requests to anon, authenticated;
grant update on public.community_prayer_requests to authenticated;

grant select, insert on public.community_convictions to anon, authenticated;
grant update, delete on public.community_convictions to authenticated;

grant select, insert on public.community_thanksgivings to anon, authenticated;

drop policy if exists "community_prayer_public_insert" on public.community_prayer_requests;
create policy "community_prayer_public_insert"
  on public.community_prayer_requests
  for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "community_prayer_staff_select" on public.community_prayer_requests;
create policy "community_prayer_staff_select"
  on public.community_prayer_requests
  for select
  to authenticated
  using (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'pastoral@camp.sg')
  );

drop policy if exists "community_prayer_staff_update" on public.community_prayer_requests;
create policy "community_prayer_staff_update"
  on public.community_prayer_requests
  for update
  to authenticated
  using (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'pastoral@camp.sg')
  )
  with check (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'pastoral@camp.sg')
  );

drop policy if exists "community_convictions_public_insert" on public.community_convictions;
create policy "community_convictions_public_insert"
  on public.community_convictions
  for insert
  to anon, authenticated
  with check (approved = false and approved_by is null);

drop policy if exists "community_convictions_public_approved_read" on public.community_convictions;
create policy "community_convictions_public_approved_read"
  on public.community_convictions
  for select
  to anon, authenticated
  using (
    approved = true
    or auth.jwt() ->> 'email' in ('admin@camp.sg', 'pastoral@camp.sg')
  );

drop policy if exists "community_convictions_staff_update" on public.community_convictions;
create policy "community_convictions_staff_update"
  on public.community_convictions
  for update
  to authenticated
  using (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'pastoral@camp.sg')
  )
  with check (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'pastoral@camp.sg')
  );

drop policy if exists "community_convictions_staff_delete" on public.community_convictions;
create policy "community_convictions_staff_delete"
  on public.community_convictions
  for delete
  to authenticated
  using (
    auth.jwt() ->> 'email' in ('admin@camp.sg', 'pastoral@camp.sg')
  );

drop policy if exists "community_thanksgivings_public_insert" on public.community_thanksgivings;
create policy "community_thanksgivings_public_insert"
  on public.community_thanksgivings
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "community_thanksgivings_public_read" on public.community_thanksgivings;
create policy "community_thanksgivings_public_read"
  on public.community_thanksgivings
  for select
  to anon, authenticated
  using (true);
