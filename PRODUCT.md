# Readrise — product truth

## Platform

web

## Users

Groups of two to five people who already know each other — friends, not an
audience. They are readers by intent rather than habit: they buy books, start
them, and stop around chapter three. Several came here specifically to spend
less time on feeds. One person per circle is the organiser who uploads the book
and sets the pace; the rest join by invite code or link.

The real scene is a weeknight, after dinner, at home. Phone on the sofa or
laptop at a desk. Sessions are twenty to forty minutes, not all evening. Nobody
is at work when they use this.

## Product Purpose

Turn private reading into a shared, accountable practice.

The loop is the product: READ → HIGHLIGHT → DISCUSS → COMMIT → CHECK IN →
VAULT. Everyone reads the same book; highlights become arguments in the margin;
each milestone produces one concrete habit the circle commits to; people check
in on each other; what mattered gets pinned to a shared vault.

The thesis the whole product is built on: **reading is an input; changed
behaviour is the output.** A circle that finished a book and changed nothing
has not used this product successfully.

## Positioning

The anti-feed. Explicitly not a social network for books: no follower counts,
no public profiles for strangers, no algorithmic timeline, no engagement
metrics. Adjacent products (Goodreads, Fable, Literal) optimise for logging and
broadcasting what you read. Readrise optimises for finishing a book with people
who will notice if you don't.

Circles are private by default. A circle only becomes public by a unanimous
vote of its members, because publishing exposes every past highlight and thread
to strangers.

## Capabilities and Constraints

Real, working capabilities:

- PDF reader with resolution-independent highlight anchoring (highlights store
  0..1 page fractions, never pixels, so they survive zoom and window changes)
- Threaded discussion anchored to a specific highlight
- Milestones (chapter ranges) that spoiler-gate discussion rooms until your own
  progress reaches them
- Reading goals: finish in N days, with pace and an optional "when will you
  read" ritual
- Micro-actions: one habit per milestone, with weekly check-ins and streaks
- Insight Vault: pinned highlights and completed actions across every book
- Live presence via SSE bridged through Supabase Realtime
- Public-circle governance: unanimous publish vote, admin moderation, shoutouts,
  a configurable leaderboard

Constraints:

- PDF only. EPUB is not supported, so text does not reflow — deep reading on a
  phone is genuinely poor and the product should be honest about it.
- Vercel serverless: 4.5MB function body cap, so uploads go directly to
  Supabase Storage; functions are short-lived, so SSE reconnects about once a
  minute.
- Prisma schema must run unchanged on SQLite (dev) and Postgres (prod): no
  enums, no scalar lists.
- Small teams by design. Nothing needs to scale to thousands of members per
  circle.

## Brand Commitments

- Name and wordmark: **Readrise**. Confirmed, not open.
- User-selectable **vibe × theme** system: four accent palettes × dark/light,
  set on `<html>` and applied through tokens. Confirmed and must survive any
  redesign — it is real personalisation the user owns. The vibe changes chrome
  only; it never changes content, and highlight colours stay semantic.
- No notification-driven re-engagement, no streak-loss guilt, no celebration
  theatre. Session end is a feature.

## Product Principles

- **Never shame the reader.** Guilt is the dominant cause of abandoning a book
  mid-way, so falling behind is reported as a still-reachable daily number,
  never as a shortfall, and never in red.
- **Show, don't narrate.** Progress gaps are visible on the bar rather than
  stated in a sentence.
- **The periphery leaves during deep work.** Focus mode removes other people
  from the frame deliberately.
- **Signal, not payload.** Realtime events carry ids; every refetch re-passes
  the authorization gate.

## Accessibility & Inclusion

Focus-visible rings are global; semantic colour is never the only signal;
`prefers-reduced-motion` collapses all animation. Known open gaps: the reader's
scroll container needs better keyboard support, and the standings chart conveys
composition partly by colour.

## Evidence on Hand

- `docs/DECISIONS.md` — D1–D30 with reasoning
- `docs/RESEARCH.md` — attention, focus and goal-setting research behind each
  UI decision, with sources
- `ux_assessment.md` — verified audit, sequenced
- Live deployment at readrise-six.vercel.app
