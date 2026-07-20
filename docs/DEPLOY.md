# Deploying to Supabase + Vercel

Order matters: the database has to exist before the app can build against it,
and the secrets have to be in Vercel before the first deploy rather than after.

---

## 1. Move the database to Supabase

**Get both connection strings.** Supabase dashboard → **Connect** → **ORMs** →
**Prisma**. You need two, and they are not interchangeable:

| Variable | Port | Used by | Why |
|---|---|---|---|
| `DATABASE_URL` | 6543 | the running app | Transaction pooler. Serverless opens a connection per invocation; a direct connection would exhaust Postgres' limit. Keep `?pgbouncer=true&connection_limit=1`. |
| `DIRECT_URL` | 5432 | `prisma db push` / `migrate` | Schema changes need a real session, which the transaction pooler cannot provide. |

Put both in `.env` (**not** `.env.local` — the Prisma CLI only reads `.env`).

**Switch the provider and push the schema:**

```bash
npm run db:postgres     # flips the datasource to postgresql
npx prisma generate
npx prisma db push      # creates every table on Supabase via DIRECT_URL
```

The schema ports cleanly because it obeys the parity rule — no enums, no scalar
lists (see the header of `prisma/schema.prisma`).

**Optional — demo data.** Only ever on a *fresh* project:

```bash
SEED_ALLOW_REMOTE=yes npm run db:seed
```

The seed **deletes every row** before inserting. `prisma/seed.ts` refuses to run
against a non-local `DATABASE_URL` without that flag precisely because the
mistake is unrecoverable. Skip this entirely if you want to launch empty.

> Note: local SQLite data does **not** migrate. `db push` creates empty tables.
> Books you uploaded locally live in `storage/` and are not carried over — in
> production, uploads go to Supabase Storage instead (see below).

---

## 2. Storage

Nothing to configure. `lib/storage.ts` switches to Supabase Storage as soon as
`SUPABASE_SECRET_KEY` is present and creates the private `documents` bucket on
first upload.

**This is not optional in production.** Vercel's filesystem is ephemeral — the
local-disk fallback would accept an upload and lose it on the next cold start.
If `SUPABASE_SECRET_KEY` is missing, uploads silently rot.

---

## 3. Environment variables in Vercel

Project → Settings → Environment Variables. Add each for **Production** (and
Preview, if you want previews to work):

| Key | Notes |
|---|---|
| `DATABASE_URL` | pooler URL, port 6543 |
| `DIRECT_URL` | direct URL, port 5432 |
| `SESSION_SECRET` | **generate a new one** — see below |
| `NEXT_PUBLIC_SUPABASE_URL` | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | safe to expose by design |
| `SUPABASE_SECRET_KEY` | server-only — never prefix `NEXT_PUBLIC_` |

Generate a production session secret:

```bash
node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"
```

Do not reuse the development value. It signs every session cookie, so anyone
holding it can forge a login as any user — and the placeholder is public in
`.env.example`. `lib/session.ts` now refuses to boot in production if it detects
the placeholder, but that catches carelessness, not a leaked real secret.

`STORAGE_DIR` is local-dev only. Don't set it in Vercel.

---

## 4. Deploy

Vercel auto-detects Next.js. `npm run build` already runs `prisma generate`
first, which is required — Vercel caches `node_modules`, and a cached Prisma
client goes stale against a changed schema without it.

No `vercel.json` is needed.

---

## 5. Known constraints

**SSE reconnects roughly every minute.** `/api/stream` declares
`maxDuration = 60`. Vercel terminates long-lived functions regardless; stating
the bound makes it clean rather than mysterious, and `EventSource` reconnects
by itself so users notice nothing. The cost is one invocation per idle tab per
minute. If that becomes a problem, subscribe the browser directly to Supabase
Realtime — `lib/events.ts` is already bridged through it, so only the server
hop would disappear.

**Reader is desktop/tablet only.** The threads sidebar is a fixed `w-[26rem]`
with no breakpoint. This is the top-ranked open item in `ux_assessment.md`.

**Leaderboard aggregates are uncached.** Four per circle, and a profile calls it
once per public circle. Fine at current scale; needs caching or a materialised
score column before real traffic.

---

## Rolling back to local SQLite

```bash
npm run db:sqlite
# set DATABASE_URL="file:./dev.db" and DIRECT_URL="file:./dev.db" in .env
npx prisma generate && npx prisma db push
```
