# Prodoxity — context for AI sessions

**Read these before doing anything. They are the project's memory — they exist
so you don't have to reconstruct intent by replaying past conversations or
re-reading the whole codebase.**

## Start here (in order)

1. [docs/DECISIONS.md](docs/DECISIONS.md) — every load-bearing decision (D1–D17)
   and bug worth remembering (B1–B4), each with its *why*. This is the fastest
   path to "why is it built this way".
2. [docs/RESEARCH.md](docs/RESEARCH.md) — the focus/attention research each UI
   decision is grounded in, with sources.
3. [docs/UX-AUDIT.md](docs/UX-AUDIT.md) — verified UI/UX findings and the
   suggested order of work. Read before starting any UI task.
4. [docs/BLUEPRINT.md](docs/BLUEPRINT.md) — architecture, the highlight-anchoring
   problem, the product loop.
5. [README.md](README.md) — how to run it, Supabase integration status.

## What Prodoxity is

A private reading circle for close friends — the *anti-feed*. Read the same
book, argue in the margins, commit to one habit, check on each other. The loop
is the product: READ → HIGHLIGHT → DISCUSS → COMMIT → CHECK IN → VAULT.

## The three things most likely to trip you up

- **Highlights store 0..1 page-fractions, never pixels** (DECISIONS D5). And
  pdf.js needs `--scale-factor` on the page container or selection silently
  captures wrong text (D6). Regression guards: `lib/anchor.test.ts`,
  `scripts/verify-capture.ts`.
- **Design tokens are a vibe × theme matrix** (D13): `data-vibe` × `data-theme`
  on `<html>`. Style through tokens (`bg-accent`, `.bg-grad`, `text-ink-*`),
  never hardcode a hex. The vibe changes chrome only — never content.
- **The event bus is signal-only** (D8) and bridged through Supabase Realtime
  (D9). Events carry ids, not payloads; refetch re-checks auth.

## Commands

```bash
npm run dev          # dev server (http://localhost:3000)
npm test             # anchoring + utils tests
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run db:seed      # reset demo data (destructive)
```

Seeded logins (password `password123`): pratik@ / maya@ / dev@ prodoxity.dev,
plus sofia@readers.dev (a non-owner in public circles — use her to test joins,
discovery and standings from a member's point of view).

## Knowledge graph (graphify)

`graphify-out/` holds a queryable knowledge graph of this project.
- `GRAPH_REPORT.md` — communities, god nodes, suggested questions.
- `graph.html` — interactive, open in a browser.
- Query it: `graphify query "your question"` (BFS) — grounds answers in the
  graph instead of re-reading files.

**Known limitation:** the AST layer ingested the vendored
`public/pdf.worker.min.mjs`, so god nodes and most communities are pdf.js
internals (noise). The *semantic* layer (design concepts, decisions D1–D17,
their code links) is clean and is the part worth querying. To rebuild without
the vendor noise, exclude `public/pdf.worker.min.mjs` before
`/graphify --update`.
