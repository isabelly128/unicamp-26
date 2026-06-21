# Supabase setup

Run `camp_content.sql` once in the Supabase SQL editor for project `lijbxbvitmhrefmnyuys`.

Set these environment variables locally and in Vercel:

```text
VITE_SUPABASE_URL=https://lijbxbvitmhrefmnyuys.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

Create a Supabase Auth user for the staff login:

```text
Email: admin@camp.sg
Password: admin2026
```

Run `camp_content.sql` after creating the table so RLS allows public reads and staff writes.

Do not put a `sb_secret_...` key in any `VITE_` variable. Supabase blocks secret keys in browsers,
and exposing one would give full database access.
