# UI/UX audit & future plan

> Snapshot taken July 2026, after the public-circles work. Every finding below
> was verified in the codebase or the browser — nothing here is a guess. Items
> are ranked by what a real user would hit first, not by how interesting they
> are to fix.

## P0 — Broken for real users

**1. PDF scroll and arrow keys don't work.** Reported by the user, not yet
fixed. Strong hypothesis, not yet confirmed: `SmoothScroll` (lenis) wraps the
entire app in `app/layout.tsx` and hijacks wheel events at the document level,
while the reader scrolls an *inner* container
(`Reader.tsx`, `flex-1 overflow-y-auto`). Lenis drives `window.scrollY`, which
that container never reads. Likely fix: exclude the reader subtree from lenis
(`data-lenis-prevent`), and add explicit `ArrowUp`/`ArrowDown`/`PageUp`/
`PageDown`/`Home`/`End` handlers on the scroll container, which currently has
no keyboard handling at all.
*This is the single highest-value fix outstanding — it breaks the core verb of
the product.*

**2. The reader is desktop-only.** The threads sidebar is a hard-coded
`w-[26rem]` with no breakpoint, so on a phone the page column is crushed to
nothing. "Read on the train" is arguably where an anti-doomscroll product has
to win, and right now it can't. Needs the sidebar to become a bottom sheet or
a tab below ~1024px.

## P1 — Coherence problems that will compound

**3. Two design-token vocabularies are live at once.** The original system is a
numeric ink ramp (`text-ink-300`, `bg-ink-900`, `border-ink-800`). Login and
signup instead use `text-ink-soft`, `border-rule/50`, `bg-ink/[0.03]` — 9 and 6
occurrences respectively. Both render, so nothing looks broken, but the app now
has two ways to say the same thing and no rule about which wins. Pick one
(the numeric ramp is the documented one, D13) and migrate the other.

**4. Two login implementations, one of them dead.**
`app/login/AuthForm.tsx` is 143 lines and is **imported nowhere** —
`app/login/page.tsx` (150 lines) is the live one. They had different
post-auth redirect logic, which is exactly the kind of drift that produces
"I fixed it but nothing changed". Delete the dead one.

**5. The brand is split.** The UI says **Readrise**; seeded accounts are
`@prodoxity.dev`; docs and the package name still say Prodoxity. Harmless in
dev, confusing the moment anyone else sees it. One sweep, once the name is
final.

**6. The notification bell contradicts a founding decision.**
`NotificationBell.tsx` is wired and functional, but D3 committed to *zero*
notifications on calm-tech grounds, and the landing page still argues against
"notifications engineered to pull you back". Either the decision changed — in
which case D3 should be amended and the landing copy updated — or the bell
should go. Right now the product argues with itself.

## P2 — Scale and polish

**7. The dashboard's three-column grid doesn't collapse gracefully.**
`lg:grid-cols-[1fr_1.2fr_18rem]` stacks below `lg`, but the activity feed then
sits above the books, which buries the primary action.

**8. The repo carries 87MB of `assets/` plus a whole parallel app.**
`assets/` holds the source scans and a 52MB unused FBX; `new changes/` is the
AI Studio project (excluded from tsconfig, still committed). Neither ships to
users, but both slow every clone. Move to Git LFS or out of the repo.

**9. Standings have no empty state.** A brand-new public circle renders three
zero-width bars and no explanation. Should say "no reading logged yet".

**10. Leaderboard cost grows with membership.** `getLeaderboard` runs four
aggregate queries per circle, and `getPublicStanding` calls it **once per
public circle the user belongs to** — so a profile page for someone in ten
circles fires forty aggregates. Fine at seed scale, needs caching or a
materialised score column before it meets real traffic.

## Accessibility

Good: focus-visible rings are global, icons carry labels, semantic colour is
never the only signal (shape and fill carry state too), `prefers-reduced-motion`
collapses all animation including the new leaderboard bars.

Gaps worth closing: the reader's scroll container isn't focusable or keyboard
operable (same root as P0-1); the standings chart conveys composition by colour
alone — the numbers underneath and per-segment `title` tooltips mitigate it, but
a screen-reader summary of each bar would be better than hover text.

## Suggested order

1. Reader scroll + keyboard (P0-1) — restores the core verb.
2. Reader responsive layout (P0-2) — unlocks mobile entirely.
3. Delete dead `AuthForm.tsx`, unify tokens (P1-3, P1-4) — cheap, stops drift.
4. Decide the notification question (P1-6) — a product call, not a code change.
5. Brand sweep (P1-5) once the name is settled.
6. Repo weight and leaderboard caching (P2-8, P2-10) before any real launch.
