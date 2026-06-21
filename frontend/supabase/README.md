# Supabase setup

Run `camp_content.sql` once in the Supabase SQL editor for project `lijbxbvitmhrefmnyuys`.

Set these Vercel environment variables for the frontend project:

```text
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SESSION_SECRET=any-long-random-string
```

Optional overrides:

```text
SUPABASE_URL=https://lijbxbvitmhrefmnyuys.supabase.co
ADMIN_EMAIL=admin@camp.sg
ADMIN_PASSWORD=your-admin-password
ADMIN_NAME=Admin Lee
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Do not add it as a `VITE_` variable.
