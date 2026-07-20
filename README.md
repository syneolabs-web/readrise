# Prodoxity

**A private reading circle for close friends.** Read together, extract insights, hold each other accountable.

Not Perusall (a classroom). Not Fable (a public book club). This is 2–12 people who know each other, reading something that's supposed to change how they live — and actually checking whether it did.

```
  READ ──► HIGHLIGHT ──► DISCUSS ──► COMMIT ──► CHECK IN ──► VAULT
   ▲                                                            │
   └────────────────── informs next read ◄──────────────────────┘
```

Every other reading platform implements the first three boxes and stops. **COMMIT → CHECK IN → VAULT is the product.**

---

## Quick start

```bash
npm run setup    # install, generate client, create db, seed demo data
npm run dev      # http://localhost:3000
```

Sign in with any seeded account — password `password123`:

| Email | Role | State |
|---|---|---|
| `pratik@prodoxity.dev` | owner | page 5, checked in |
| `maya@prodoxity.dev` | member | page 4, checked in |
| `dev@prodoxity.dev` | member | page 2 — **Ch.3 room is locked for him** |

The seed generates a real 6-page PDF (original prose, written for this), a circle, milestones, cross-member highlights with threads, uneven reading progress, a live Micro-Action, a completed one from last week, and vault entries — so the whole loop is visible on first load.

> **Open two accounts in two different browsers** to watch highlights and chat sync live.

---

## What's here

**The reading surface** — Upload a PDF, it renders split-pane. Select any sentence → highlight in one of 5 colors → thread opens in the margin. Everyone's marks are shared and live.

**Micro-Actions** — At a chapter boundary the circle commits to one concrete habit. Everyone checks in. The streak belongs to the circle: one person missing breaks it for all.

**Insight Vault** — Pin any highlight or completed action. Searchable across every book the circle has read. The artifact that survives the reading.

**Progress Match** — Live tracker of who's on what page, in the toolbar while you read.

**Spoiler gating** — Each milestone has its own room, locked until *your* progress reaches its last page. Enforced server-side, not just hidden in the UI.

---

## The one thing worth reading the code for

Highlight anchoring. The obvious implementation stores `getBoundingClientRect()`:

```js
{ page: 3, x: 412, y: 887, width: 230, height: 18 }   // ❌
```

Those are viewport pixels at one zoom, on one window size, at one DPI. It looks perfect for whoever made the highlight and lands on the **wrong paragraph** for everyone else — so you ship it, because you tested it on your own screen.

Prodoxity stores fractions of the PDF page's own coordinate space:

```ts
{ page: 3, rects: [{ x: 0.121, y: 0.443, w: 0.377, h: 0.019 }], … }   // ✅
```

Rendering is then a pure multiply against whatever size the page is right now. Zoom, resize, DPI, and device differences all become free, because the stored value never referenced the screen.

Verified live at 115%, 130%, and 175% — the highlight tracks its text exactly. `lib/anchor.test.ts` pins the invariant.

Full reasoning: [docs/BLUEPRINT.md](docs/BLUEPRINT.md) §3.

---

## Commands

```bash
npm run dev          # dev server
npm test             # anchoring + utils tests (node:test)
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run db:seed      # reset demo data (destructive)
npm run db:studio    # browse the database
npm run db:postgres  # switch provider sqlite -> postgresql
```

---

## Stack & structure

Next.js 15 (App Router) · TypeScript · Prisma · SQLite (dev) / Postgres (prod) · Tailwind v4 · pdf.js · SSE

```
app/
  api/            mutations + the SSE stream
  circles/[slug]/ circle home, Micro-Actions, Vault
  read/[id]/      the reader
components/reader/ PDF page, highlight layer, threads, chat
lib/
  anchor.ts       ← the normalization math
  events.ts       ← in-process pub/sub behind a swappable interface
  auth.ts         ← the single authorization gate
prisma/           schema + seed (generates its own PDF)
docs/BLUEPRINT.md architecture & rationale
```

Server Components read through Prisma directly; API routes exist only for mutations and the stream.

---

## Supabase integration

The app uses Supabase as **infrastructure**, not as an auth provider — login stays on the app's own JWT sessions.

| Piece | Backend | Needs | Status |
|---|---|---|---|
| Live sync | Supabase Realtime broadcast (`lib/events.ts`) | publishable key | ✅ active — verified cross-instance round-trip |
| PDF storage | Supabase Storage, private bucket (`lib/storage.ts`) | `SUPABASE_SECRET_KEY` in `.env.local` | ▢ falls back to local disk until key is set |
| Database | Supabase Postgres via Prisma | connection string in `.env` | ▢ SQLite until then |

Live events cross server instances through a `circle:{id}` broadcast channel; events carry only ids (never payloads), so every read still passes the membership gate. Without Supabase env vars everything degrades to the original in-process bus and local disk — dev works offline.

**To finish the migration:**

```bash
# 1. Storage — Dashboard → Project Settings → API keys → secret
#    add to .env.local:  SUPABASE_SECRET_KEY=sb_secret_...

# 2. Database — Dashboard → Connect → Session pooler URI
#    put it in .env as DATABASE_URL, then:
npm run db:postgres
npx prisma db push
npm run db:seed
```

The schema is parity-safe (no enums, no scalar lists — the only two things that don't port between SQLite and Postgres), so the provider flip really is one line.

## Known limitations (deliberate)

**Progress is self-reported.** Spoiler gating is a courtesy rail among friends, not an adversarial control.

**PDF only.** No EPUB, no web-page annotation, no mobile app.

**Reader is desktop-shaped.** The fixed sidebar needs a responsive pass before phone use.
