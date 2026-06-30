# Supabase setup

Run `camp_content.sql` once in the Supabase SQL editor for project `lijbxbvitmhrefmnyuys`.
It is safe to rerun. The script keeps the shared `unicamp-2026` row compatible with the
latest booklet JSON shape by adding missing `busRows`, `prayerRooms`, and `medicText` keys
without deleting existing content.

Run `camp_photo_storage.sql` once too. It creates/updates the public `camp-photos` storage bucket
and adds RLS policies so only authenticated `admin@camp.sg` and `comms@camp.sg` users can upload,
replace, or delete images.

Run `community_wall.sql` once as well. It creates persistent tables for the prayer wall,
convictions, and thanksgivings. Public visitors can submit, approved testimony content is public,
and prayer requests/pending convictions are only visible to `admin@camp.sg` and `pastoral@camp.sg`.
Rerun it after updates; it is safe to rerun and will add new columns such as the optional prayer
and testimony request name fields.

Set these environment variables locally and in Vercel:

```text
VITE_SUPABASE_URL=https://lijbxbvitmhrefmnyuys.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
VITE_SUPABASE_PHOTO_BUCKET=camp-photos
```

Create a Supabase Auth user for the staff login:

```text
Email: admin@camp.sg
Password: admin2026
```

Create `pastoral@camp.sg` too if pastoral leaders need to review prayer requests and convictions.

Run `camp_content.sql` after creating the table so RLS allows public reads and staff writes.
Booklet, devotion, sermon, lodging, food, photo, bus timing, prayer room, and medic content
are stored in the `content` JSONB column of `public.camp_content`.

Do not put a `sb_secret_...` key in any `VITE_` variable. Supabase blocks secret keys in browsers,
and exposing one would give full database access.
