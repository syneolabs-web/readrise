# Readrise — UI/UX assessment & sequenced plan

> Merges the original assessment with `docs/UX-AUDIT.md` (findings verified in
> the codebase or the browser) and the research in `docs/RESEARCH.md`.
>
> Everything is evaluated against the thesis: **reading is an input; changed
> behaviour is the output.**
>
> Each item is tagged **[SHIPPED]**, **[NEXT]**, **[LATER]**, or **[REJECTED]**,
> with the reason. Aspiration and status are kept separate on purpose — an
> assessment that doesn't say what's actually true stops being useful the
> moment someone relies on it.

---

## 0. What shipped in this pass

| Item | Where |
|---|---|
| Reading goals — deadline + pace + ritual, set at upload, shown on the uploader's home | `lib/reading-goal.ts`, `components/GoalCard.tsx`, `app/circles/page.tsx` |
| Standings empty state | `app/circles/[slug]/Leaderboard.tsx` |
| Deleted dead `app/login/AuthForm.tsx` (143 lines, imported nowhere) | — |

---

## 1. Core visual language

The `vibe` × `theme` matrix is the strongest architectural call in the product:
personalisation that never touches the semantics of an annotation. `ink`/`paper`
over raw hex keeps long sessions comfortable. Gradients stay reserved for
progress and streaks, so the book keeps the page.

**[NEXT] Typographic floor.** `text-2xs` is 0.694rem — around 11px. It's used
for tags, metadata and several empty states. It reads as elegant on a 27"
display and as inaccessible on a laptop. Raise the floor to ~12px and carry
hierarchy with weight and `text-ink-*` steps instead of size. This is the
cheapest accessibility win available and it touches one token.

**[NEXT] Motion.** Hover states are instantaneous background swaps. Spring
physics on modals and a `hover:scale-[1.02]` on cards would lift the whole app.
One caveat that is not optional: every animation must stay inside the existing
`prefers-reduced-motion` guard the leaderboard already respects.

**[LATER] Glassmorphism on sticky headers.** Real depth win, but `backdrop-blur`
on a scrolling PDF canvas is a measurable repaint cost. Worth it on the app
chrome, worth measuring before it goes near the reader.

---

## 2. First-time experience — the real drop-off

This is the highest-leverage section in the document, and the original
assessment identified the right problem: **time-to-value is gated behind a
six-step chain** (join → upload → read → highlight → milestone → commit). A
user who sees three empty panels can't distinguish this from a file-sharing app.

**[NEXT] The pre-loaded playground.** Every new user lands in a demo circle
holding a short manifesto that *already* has highlights, a live thread and one
completed micro-action. This is the single highest-ROI item in the whole
assessment: it moves the payoff from step six to step zero. Nothing else here
comes close on value-per-hour.

**[NEXT] Public-domain starter library.** "Upload a PDF" assumes a PDF is
already on the disk at signup. Five to ten curated classics, one click to add,
removes the hardest moment in the funnel. Pairs with the playground — build
both or neither.

**[NEXT] Empty states that teach.** "Nothing here" wastes the one moment the
user is actually looking. The vault should say what it's *for*. The standings
empty state shipped in this pass is the template; the vault and lounge should
follow it.

**[LATER] First-run tooltip on the highlight tool.** Good idea, but it competes
with the playground — if the demo circle lands, the mechanic teaches itself by
example, which is strictly better than an overlay.

---

## 3. The reader

Resolution-independent anchoring (D5/D6) is the technical foundation the rest of
the product stands on, and focus mode is the clearest expression of the thesis
anywhere in the app.

**[NEXT — P0] Responsive layout.** The threads sidebar is a hard-coded `w-[26rem]`
with no breakpoint, so below ~1024px the page column is crushed. It needs to
become a bottom sheet or a tab. "Read on the train" is where an anti-doomscroll
product has to win, and today it can't. **This is the top-ranked outstanding
item.**

**[NEXT] Progress scrubber with friend avatars.** A horizontal scrubber showing
*where your friends are in this book* is the feature most likely to make the
circle feel alive. It's Progress Match made spatial, and it's the differentiator
no reading app has. High value, moderate cost.

**[LATER] Selection popover polish.** Real, but cosmetic next to the two above.

---

## 4. The action layer

**[NEXT] Reflective micro-actions.** Replacing the check-box with "how did it
go?" in one sentence is the closest thing here to the product's actual thesis —
it's the moment the input becomes an output, and the reflections make the lounge
worth opening. Cheap to build, disproportionate payoff.

**[LATER] Vault memory grid + colour filters.** Correct diagnosis: a flat list
stops scaling. Not urgent until vaults get big, which they haven't.

**[REJECTED as specified] Confetti on milestones.** D17 committed to "built, not
spent" — no guilt metrics, no return hooks, no celebration theatre. Confetti is
the reward-loop vocabulary the landing page explicitly argues against. The
underlying need (finishing should *feel* like something) is real and should be
met the way the recap already does it: a quiet, well-set statement of what was
built. If this changes, D17 changes with it — the product shouldn't argue with
itself in two places.

---

## 5. Feature additions

**[SHIPPED] Reading goals.** Every uploaded book can carry "finish in N days".
The research (RESEARCH §8) forced the shape more than taste did:

- Specific, deadline-bound goals beat "do your best" in most studies — so the
  deadline is concrete and the pace is computed.
- Implementation intentions roughly double follow-through — so there's a
  one-line "when will you read?" field, with a placeholder that teaches the
  format rather than explaining it.
- **Guilt is the dominant reason readers abandon books.** So falling behind is
  never red, never worded as a shortfall, and past the deadline the app offers
  more days instead of a verdict. The time-vs-pages gap is shown on the bar
  rather than narrated. `lib/reading-goal.test.ts` asserts the copy against a
  banned-word list, so a future refactor can't quietly make it punitive.

**[NEXT] Sepia / warm paper mode.** Straightforward within the token system, and
it addresses real halation on dark backgrounds. Best value-per-hour of the
remaining feature ideas.

**[LATER] Voice marginalia.** Genuinely intimate, and genuinely a project:
recording, storage, transcoding, playback, moderation, plus the accessibility
obligation to transcribe. Not next.

---

## 6. Coherence problems (verified)

**[NEXT] Two token vocabularies are live.** The numeric ink ramp (`text-ink-300`)
is the documented system (D13); login and signup use `text-ink-soft`,
`border-rule/50` instead. Both render, so nothing looks broken — which is
exactly why it will spread. Migrate to the numeric ramp.

**[NEXT] The notification bell contradicts D3.** The bell is wired and working;
D3 committed to *zero* notifications on calm-tech grounds and the landing page
still argues against "notifications engineered to pull you back". This is a
product decision, not a code change: either amend D3 and update the landing
copy, or remove the bell. Right now the product contradicts itself in public.

**[LATER] Brand split.** UI says Readrise, seeded accounts say `@prodoxity.dev`,
package name says prodoxity. One sweep, once the name is final.

**[LATER] Repo weight.** 87MB of `assets/` including an unused 52MB FBX, plus
the `new changes/` AI Studio project. Neither ships. Git LFS or out of the repo
before anyone else clones it.

**[LATER] Leaderboard cost.** `getLeaderboard` runs four aggregates per circle
and `getPublicStanding` calls it once per public circle — a profile for someone
in ten circles fires forty aggregates. Fine at seed scale; needs caching or a
materialised score column before real traffic.

---

## 7. Mobile

The original assessment's conclusion holds and is worth restating plainly:
**there is no viable mobile PDF reader.** A fixed-layout 6×9 page on a 6" screen
means pinch-and-pan on every line. Tablets are fine; phones are not.

But the split it identifies is the important insight: **the social layer is
mobile-native.** Checking the circle, replying to a margin thread, and checking
in on a micro-action are all things people want to do in a queue.

- **Phase 1 [NEXT]:** make `/circles`, `/vault` and threads genuinely good on a
  phone. On `/read/[id]`, show a friendly interstitial suggesting a larger
  screen — bypassable, never a wall.
- **Phase 2 [LATER]:** EPUB. Reflowable text is the only path to a real mobile
  reading app, and it's an anchoring-architecture change, not a feature.

---

## Recommended order

1. **Reader responsive layout** — the only remaining P0; unlocks mobile entirely.
2. **Playground circle + starter library** — collapses time-to-value, the
   biggest funnel problem in the product.
3. **Typographic floor + teaching empty states** — cheap, broad, accessibility.
4. **Reflective micro-actions** — closes the loop the thesis is built on.
5. **Sepia mode + motion pass** — polish with real comfort value.
6. **Decide the notification question** — a product call; stops a public
   contradiction.
7. **Progress scrubber with friend avatars** — the differentiating feature.
8. **Token unification, brand sweep, repo weight, leaderboard caching** — before
   any real launch.
