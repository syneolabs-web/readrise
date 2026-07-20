# Prodoxity — Blueprint

> A private reading circle for close friends. Read together, extract insights, hold each other accountable.

---

## 1. The thesis

Every existing platform optimizes for the wrong unit.

| Platform | Optimizes for | Why it fails your use case |
|---|---|---|
| Perusall | Instructor-managed classrooms | Built for grading compliance, 40+ strangers, institutional login |
| Hypothesis | Annotating the open web | No group structure, no progress, no accountability |
| Fable | Public book clubs at scale | Discovery-driven, social-feed noise, novels not growth books |
| Literal | Beautiful passive tracking | Tracking ≠ discussion ≠ change |
| Bookship | Casual mobile clubs | Chat-first, weak annotation, no action layer |

**None of them close the loop.** They all end at *discussion*. Discussion is the middle of the funnel, not the end.

Prodoxity's premise: **reading is an input; changed behavior is the output.** The product is built around that loop, and every feature either feeds it or is cut.

```
  READ ──► HIGHLIGHT ──► DISCUSS ──► COMMIT ──► CHECK IN ──► VAULT
   ▲                                                            │
   └────────────────── informs next read ◄──────────────────────┘
```

Perusall and Hypothesis implement the first three boxes. **COMMIT → CHECK IN → VAULT is the product.** That is the entire reason this exists.

### Design consequences of "close friends"

Small-group intimacy is a *technical* constraint, not just vibes. It buys real simplifications:

- **Invite-code only, no discovery.** No search, no recommendations, no public profiles, no moderation queue, no abuse reporting. Enormous scope reduction.
- **Circles of 2–12.** Every member can be loaded in one query. No pagination on membership, no fan-out service, no follower graph.
- **Trust is assumed inside the circle.** No per-annotation ACLs. The circle *is* the permission boundary — a single join check gates everything.
- **No spoiler anxiety at scale.** Milestone gating is a courtesy, not a safety system.
- **Real-time is cheap.** A dozen concurrent SSE clients per circle, not a million. An in-process event bus is genuinely correct here, not a shortcut.

This is why Prodoxity can ship features Perusall can't justify: the small-group assumption removes ~70% of what makes social reading platforms expensive.

---

## 2. Feature spec

### Layer 1 — The reading surface (table stakes)
- Upload a PDF to a circle; it renders in a split-pane reader.
- Select text → highlight in one of 5 colors → optionally open a thread.
- Highlights are **shared by default**. Everyone in the circle sees everyone's marks, live.
- Threaded comments anchored to a highlight, with upvotes and `@`-free plain replies.
- Sidebar switches between **Threads** (anchored discussion) and **Lounge** (free chat).

### Layer 2 — The accountability engine (the differentiator)
- **Micro-Actions.** At a chapter boundary, the circle commits to one concrete habit derived from the reading. Each member checks in. The platform tracks the streak.
- **Insight Vault.** Any highlight or completed action can be pinned to a shared, searchable index — the circle's private second brain, indexed across every book read.
- **Progress Match.** A live tracker of who is on what page. Visible, gentle, and the mechanism behind spoiler gating.

### Layer 3 — Milestones & spoiler safety
- A document is divided into **milestones** (chapter ranges).
- Each milestone has its own discussion room.
- **A milestone room is locked until your own progress reaches its end page.** You cannot read ahead into your friends' reactions. Progress is self-reported — this is a courtesy rail for friends, not an adversarial control.

### Explicitly out of scope for the MVP
Public discovery · EPUB · mobile apps · video chat · OCR · payments · notifications · following · web-page annotation.

---

## 3. The hard problem: highlight anchoring

This is the part that "can get mathematically tricky," and it's where a naive implementation quietly breaks.

### The trap

The obvious approach — store `getBoundingClientRect()` output:

```js
// ❌ WRONG — what most first attempts do
{ page: 3, x: 412, y: 887, width: 230, height: 18 }
```

These are **viewport pixels at one specific zoom level, on one specific window size, at one device pixel ratio.** The bug is not hypothetical and it is not subtle:

- You highlight at 100% zoom. Your friend reads at 150% → **highlight lands on the wrong line.**
- You're on a 27" monitor, they're on a 13" laptop → **wrong paragraph.**
- Retina vs. standard DPI → **silently offset.**
- Someone resizes their window → **every highlight on screen shifts.**

The highlight *appears* to work perfectly for whoever created it, and is wrong for everyone else. That makes it a bug you ship, because you tested it on your own screen.

### The fix: normalize against the PDF's own coordinate space

Every PDF page has an intrinsic size at scale 1.0 (`page.getViewport({ scale: 1 })`). Normalize every rect against it and store fractions of the page, 0..1:

```ts
// ✅ RIGHT — resolution-independent, stored in the DB
{
  page: 3,
  rects: [{ x: 0.121, y: 0.443, w: 0.377, h: 0.019 }],  // fractions of page W/H
  textContent: "The key to habit change is identity, not outcomes.",
  textStart: 1840, textEnd: 1889   // char offsets in the page's text layer
}
```

Rendering is then a pure multiply against whatever size the page happens to be *right now*:

```ts
left = rect.x * renderedWidth;
top  = rect.y * renderedHeight;
```

Zoom, resize, DPI, and device differences all become **free**, because the stored value never referenced the screen in the first place.

`textContent` and the char offsets are carried as a **fallback anchor**: if the geometry ever fails to resolve, the highlight can be re-found by locating its text in the page's text layer. Perusall and Hypothesis both use a layered anchoring strategy for the same reason — geometry is fast but brittle, text is slow but durable. Storing both costs a few bytes and buys durability.

### Multi-rect selections

A selection crossing lines produces multiple client rects. We store an **array** of normalized rects, filtering out zero-area and fully-contained duplicates that browsers emit. One highlight = N painted boxes.

Implementation: [`lib/anchor.ts`](../lib/anchor.ts) · [`components/reader/HighlightLayer.tsx`](../components/reader/HighlightLayer.tsx)

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js 15 App Router                                       │
│                                                              │
│  Server Components ── data reads via Prisma (no API hop)     │
│  Client Components ── reader, live layers, forms             │
│         │                                                    │
│         ├── POST /api/*        mutations (zod-validated)     │
│         └── GET  /api/stream   SSE ← in-process event bus    │
└──────────────────────────────────────────────────────────────┘
                            │
                     Prisma Client
                            │
              SQLite (dev)  ·  Postgres (prod)
                            │
                   Local disk  ·  S3/Blob (prod)
```

### Why these choices

**Server Components for reads.** Circle pages, vault, and progress are server-rendered directly against Prisma. No REST layer for data that never leaves the server. API routes exist only for *mutations* and the *stream*.

**SSE, not WebSockets.** Traffic is ~99% server→client (someone else highlighted). Client→server already has a perfectly good channel: HTTP POST. SSE is one `GET` with `text/event-stream`, auto-reconnects natively, needs no extra process, and traverses proxies without upgrade negotiation. WebSockets would add a bidirectional transport to solve a unidirectional problem.

**In-process event bus.** ~12 concurrent clients per circle. A `Map<circleId, Set<controller>>` is the right data structure at this scale, and pretending otherwise is architecture cosplay. It is deliberately hidden behind a `publish/subscribe` interface in [`lib/events.ts`](../lib/events.ts) so the swap is mechanical.

> **Limitation closed (was: single-instance live sync).** The MVP shipped with an in-process bus, correct for one Node instance but blind across a multi-instance deploy. As designed, the swap stayed inside one file: `lib/events.ts` now bridges every `publish()` through a Supabase Realtime broadcast channel (`circle:{id}`), and each instance subscribes to the circles it serves. Verified with a two-client round-trip through the live project (`scripts/verify-realtime.ts`, 2.7s). Events still carry only ids — reads re-pass the authorization gate — and without Supabase env vars the bus degrades to in-process, so dev works offline.

**JWT session cookie, not NextAuth.** Six users who know each other. `jose` + `bcryptjs` + an httpOnly cookie is ~60 lines, has no provider config, no adapter, no version churn, and no callback maze. NextAuth solves OAuth federation — a problem this product does not have.

**pdfjs-dist directly, not react-pdf.** We need the text layer for selection, and intrinsic viewport dimensions for normalization. A wrapper would abstract away exactly the two things the core feature depends on.

**SQLite dev / Postgres prod.** No Postgres or Docker on the target machine. The schema is written **parity-safe** — no enums, no scalar lists — so the provider is a genuine one-line change (`npm run db:postgres`). Union types are `String` + a TS type; rect arrays are `Json`.

---

## 5. Data model

Parity-safe: no enums, no scalar arrays.

```
User ──< Membership >── Circle ──< Document ──< Milestone
 │                        │           │             │
 │                        │           ├──< Highlight ──< Comment ──< CommentVote
 │                        │           │        │
 │                        │           │        └──< VaultEntry
 │                        │           └──< ReadingProgress
 │                        │
 │                        ├──< ChatMessage        (Lounge + milestone rooms)
 │                        └──< MicroAction ──< ActionCheckin
 └── authored everything above
```

| Model | Purpose | Notes |
|---|---|---|
| `User` | Identity | email, bcrypt hash, display name, avatar color |
| `Circle` | The private group | `inviteCode` is the only way in |
| `Membership` | User ↔ Circle | `role`: `owner` \| `member`. The permission boundary. |
| `Document` | An uploaded PDF | `storageKey`, `pageCount`, owning circle |
| `Milestone` | Chapter range | `startPage`/`endPage` drive spoiler gating |
| `Highlight` | **The core record** | `pageNumber`, `rects` (Json, normalized), `textContent`, `textStart/End`, `color` |
| `Comment` | Threaded, anchored | `parentId` self-relation for replies |
| `CommentVote` | Upvote | unique on `(commentId, userId)` |
| `ChatMessage` | Lounge / milestone room | `milestoneId` null = Lounge |
| `ReadingProgress` | Progress Match + gating | unique on `(userId, documentId)` |
| `MicroAction` | The commitment | `weekOf` buckets the streak |
| `ActionCheckin` | Did you do it | unique on `(microActionId, userId)` |
| `VaultEntry` | Insight Vault | pins a highlight or an action; `note` for synthesis |

Full schema: [`prisma/schema.prisma`](../prisma/schema.prisma)

### Why `rects` is `Json`

A highlight has N rects (one per line spanned). Postgres could use `Jsonb` or a child table; SQLite has neither arrays nor `Jsonb`. A child table would mean a join on the hottest read path (every highlight on every page render) to reconstruct data that is **never queried independently** — you always want all rects for a highlight, and never "find highlights by rect". Json is the correct normalization boundary here: the rect array is a value object, not an entity.

---

## 6. Security model

- **Passwords**: bcrypt, cost 10.
- **Session**: `jose`-signed JWT (HS256), httpOnly + sameSite=lax + secure-in-prod cookie, 30-day expiry.
- **Authorization**: every mutation and every document read passes through `requireCircleMember()` / `requireDocumentAccess()` in [`lib/auth.ts`](../lib/auth.ts). There is exactly one gate, and it is a `Membership` lookup.
- **File serving**: uploads are stored **outside** `public/`. They are streamed through an authenticated route handler that checks circle membership first. A PDF in a private circle must never be a guessable public URL.
- **Upload validation**: MIME + magic-byte (`%PDF-`) check, 50MB cap, randomized storage key.
- **Ownership**: only the author may delete a highlight/comment; only an `owner` may delete a document.

---

## 7. Build phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Scaffold, schema, auth, session | ✅ MVP |
| 1 | Upload, PDF render, text layer | ✅ MVP |
| 2 | Highlight engine + normalized anchoring | ✅ MVP |
| 3 | Threads, votes, Lounge chat | ✅ MVP |
| 4 | SSE live sync | ✅ MVP |
| 5 | Progress Match, milestones, spoiler gating | ✅ MVP |
| 6 | Micro-Actions + check-ins + streaks | ✅ MVP |
| 7 | Insight Vault + cross-book search | ✅ MVP |
| 8 | Redis/LISTEN-NOTIFY bus, S3, EPUB, mobile | ▢ Post-MVP |

### Verification record

Driven end-to-end in a real browser, not just typechecked:

- **Anchoring holds across zoom.** The same highlight tracks its text exactly at 115%, 130%, and 175%. This is the load-bearing claim of §3, and it's pinned by `lib/anchor.test.ts` (12 tests) so a regression fails CI rather than silently shipping.
- **Round-trip via real selection.** A highlight created by actual browser text selection stored 13 normalized rects (a 13-line paragraph), every value inside 0..1. The API schema rejects anything outside that range, so a 200 here *is* the proof that no viewport pixel leaked into the database.
- **Two independent derivations agree.** A browser-created rect landed at `x = 0.11758`; the seed, computing from Helvetica AFM metrics, landed at `x = 0.11765`. Both are the left margin (72/612 = 0.117647). Live DOM geometry and font-metric math agree to four decimals.
- **Spoiler gating works.** Maya (page 4) sees Ch.3 locked: "unlocks when you finish page 6."

Three real bugs were found and fixed during verification, each worth recording:

1. **An unbounded render loop.** `PdfPage` listed `onSizeChange` in its effect deps while the parent passed an inline arrow — so reporting a size re-rendered the parent, which made a new callback, which re-rasterized the canvas, forever. It pegged the CPU and wedged the browser. Fixed by holding the callback in a ref and excluding it from deps.
2. **A timezone bug in streak bucketing.** `weekOf()` mixed local date getters with `Date.UTC()`, putting a Sunday-night check-in from any timezone east of UTC into next week's bucket — silently breaking streaks. Caught by a test, not by looking.
3. **Seeded highlights drifted.** The seed approximated Helvetica at 0.5em/char; it's proportional, so error accumulated across a line and highlights landed several characters right of their text — looking exactly like an anchoring bug when the engine was fine. Fixed with real AFM width tables (`scripts/helvetica-metrics.ts`).

---

## 8. Running it

```bash
npm run setup     # install + generate + push schema + seed
npm run dev       # http://localhost:3000
```

Seeded logins — password `password123` for all:

- `pratik@prodoxity.dev`
- `maya@prodoxity.dev`
- `dev@prodoxity.dev`

The seed creates a circle (**Growth Mindset**), a real generated PDF, milestones, cross-member highlights with threads, progress, a live Micro-Action, and vault entries — so the loop is visible on first load rather than requiring you to hand-build state.

### Deploying to Postgres

```bash
npm run db:postgres              # flips the provider line
# set DATABASE_URL=postgresql://...
npx prisma db push
```

Then swap the event bus (§4) and move uploads to blob storage.
