-- Run this once in the Supabase SQL editor for project lijbxbvitmhrefmnyuys.
-- The bucket itself has already been created through the Storage API when possible,
-- but this script is safe to re-run and is still needed for authenticated browser uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'camp-photos',
  'camp-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "camp_photos_public_read" on storage.objects;
create policy "camp_photos_public_read"
  on storage.objects
  for select
  using (bucket_id = 'camp-photos');

drop policy if exists "camp_photos_staff_insert" on storage.objects;
create policy "camp_photos_staff_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'camp-photos'
    and auth.jwt() ->> 'email' in ('admin@camp.sg', 'comms@camp.sg')
  );

drop policy if exists "camp_photos_staff_update" on storage.objects;
create policy "camp_photos_staff_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'camp-photos'
    and auth.jwt() ->> 'email' in ('admin@camp.sg', 'comms@camp.sg')
  )
  with check (
    bucket_id = 'camp-photos'
    and auth.jwt() ->> 'email' in ('admin@camp.sg', 'comms@camp.sg')
  );

drop policy if exists "camp_photos_staff_delete" on storage.objects;
create policy "camp_photos_staff_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'camp-photos'
    and auth.jwt() ->> 'email' in ('admin@camp.sg', 'comms@camp.sg')
  );
