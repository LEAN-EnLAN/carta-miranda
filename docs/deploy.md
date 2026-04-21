# Deploy

## Recommended free setup

Use:

- **Vercel Hobby** for the Next.js app
- **Supabase Free** for persistence

This app can still run locally with `.data/carta-miranda.json`, but for a real internet deploy it should use Supabase.

## Why this works

- Vercel hosts the frontend and route handlers for free
- Supabase stores the app state in Postgres (`jsonb`) so letters, drafts, sessions and notifications survive deploys and restarts
- The hidden automation endpoints stay server-only

## 1. Create Supabase project

Create a new Supabase project, then run the SQL in:

```text
supabase/schema.sql
```

That creates the `public.app_state` table used by the app.

## 2. Configure environment variables

Copy `.env.example` values into Vercel project env vars:

- `AUTH_SECRET`
- `AGENT_TOKEN`
- `CARTA_MIRANDA_AUTOMATION_PROVIDER`
- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STATE_KEY`

Recommended:

- `APP_URL=https://your-project.vercel.app`
- `SUPABASE_STATE_KEY=primary`
- `CARTA_MIRANDA_AUTOMATION_PROVIDER=local`

## 3. Migrate existing local data (optional)

If you already wrote letters locally and want to keep them:

```bash
npm run migrate:supabase
```

By default it uploads `.data/carta-miranda.json` into the `primary` app state row.

## 4. Deploy to Vercel

Push the repo to GitHub and import it into Vercel.

No special configuration is needed besides environment variables.

## 5. Hidden terminal automation

Draft from terminal:

```bash
APP_URL=https://your-project.vercel.app npm run automation -- draft leandro miranda "una carta cortita para hoy"
```

Send directly:

```bash
APP_URL=https://your-project.vercel.app npm run automation -- send leandro miranda "te pienso todo el tiempo"
```

This uses:

- `POST /api/internal/agent/draft`
- `POST /api/internal/agent/send`

and requires `AGENT_TOKEN`.

## Notes

- In local development, if Supabase env vars are missing, the app falls back to `.data/carta-miranda.json`
- In production, set Supabase env vars so persistence is external and stable
- This is intentionally a pragmatic first deploy: the whole app state lives in one `jsonb` row for simplicity

## Future improvement

Later, if you want, we can normalize `app_state` into real tables:

- `letters`
- `letter_versions`
- `sessions`
- `notifications`
- `automation_runs`

But for shipping now, this setup is the fastest sane path
