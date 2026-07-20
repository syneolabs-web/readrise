# Decision log

> One entry per load-bearing decision, with the why. This file plus
> [RESEARCH.md](RESEARCH.md) and [BLUEPRINT.md](BLUEPRINT.md) is the project's
> memory: a future session (or the graphify knowledge graph built from these)
> should be able to reconstruct intent without replaying any conversation.

## Product

**D1 — The product is the loop, not the reader.**
READ → HIGHLIGHT → DISCUSS → COMMIT → CHECK IN → VAULT. Perusall/Hypothesis/
Fable all stop at discuss; the last three steps are the reason Prodoxity
exists. Every feature must feed the loop or be cut. (BLUEPRINT §1)

**D2 — "Close friends" is a technical constraint.**
Circles of 2–12, invite-code only, no discovery. This deletes moderation,
abuse-reporting, follower graphs, pagination-of-members, and per-annotation
ACLs. The Membership row is the single authorization gate; non-membership
returns 404, never 403.

**D3 — [SUPERSEDED by D21] The anti-feed positioning.**
Originally: no notifications, no discovery, no metrics; the landing sorted by
intent. Reversed by user decision — see D21. Kept here because much of the
calm-tech restraint (no infinite scroll, no autoplay, no vanity comparison
counts) still holds inside the new social surfaces.

**D21 — Pivot: adopt the social-reading direction (reverses D3).**
Per explicit user decision, Prodoxity became a social reading platform:
- **Activity dashboard** as home (`/circles`) — a feed of what your circles
  did, a reading snapshot, and a "what you've built" panel.
- **Discovery** (`/discover`, "Global Pulse") — public circles (`isPublic`)
  joinable without a code, and books ranked by highlight count.
- **Notifications** — a bell in the header; deliberately narrow (things
  addressed to you: replies to your highlights, your highlights vaulted), not
  a firehose.
- The landing keeps the user's "learn and grow / waste your life" hero line
  (aspirational, theirs) but drops the militant anti-feed copy for a welcoming
  pitch. The manifesto passages were reframed from anti-social-media to
  reading-together.
What was RETAINED from the old stance (the parts that were good regardless):
no infinite scroll, no autoplay, nothing loops, no "you might also like",
Focus mode, and no cross-user vanity leaderboards. Data lives in
`lib/activity.ts` (derived read-models; no separate event store). The neon
glow from the references was NOT adopted (elite-ui anti-pattern); vibe
gradients stand in.

**D4 — Distraction is redirected, not blocked.**
Tangents get the Lounge; social bursts get margin threads; both stay one
click from the page. "You can waste two hours here — you'll just be two hours
further into the book." (RESEARCH §2, rhythmic UX)

## The hard technical problem

**D5 — Highlights store page-fractions, never pixels.**
`rects` are 0..1 fractions of the PDF page's intrinsic size; rendering is a
pure multiply against the current size, so zoom/resize/DPI are free.
Text content + char offsets ride along as a fallback anchor (the
Perusall/Hypothesis layered-anchor strategy). Verified: same highlight exact
at 115/130/175% zoom; browser-made rect and font-metric-derived rect agree to
4 decimals (both 72/612 = 0.117647). Guarded by `lib/anchor.test.ts` and
`scripts/verify-capture.ts`.

**D6 — pdf.js requires `--scale-factor` on the page container.**
Without it, the text layer's `calc()` font-size silently falls back to 16px
and the invisible selectable text renders ~12% wide — selections capture the
wrong characters while the page LOOKS perfect. Root cause of the truncated-
thread-text bug. Fix: one CSS var in `PdfPage.tsx`; regression guard compares
stored rects against Helvetica AFM widths (0.00% error after fix).

**D7 — Highlight hover/click is hit-tested, not DOM-evented.**
The text layer (z-2) must sit above highlight marks (z-1) so selection works
over existing marks — which means marks can never receive pointer events.
Marks are pure paint; hover/click resolve by testing the cursor against
stored geometry on the page container. (`HighlightLayer.tsx`)

## Architecture

**D8 — SSE + signal-only events, not WebSockets.**
Traffic is ~99% server→client; POST covers the rest. Events carry only ids —
every refetch re-passes the auth gate, so the stream can't leak.

**D9 — Supabase is infrastructure, not auth.**
Realtime broadcast bridges `publish()` across instances (`circle:{id}`
channels, `self: false`, local fan-out first) — verified 2.7s round-trip with
two independent clients. Storage backend ships behind `SUPABASE_SECRET_KEY`
with local-disk fallback. DB migration is one line (`npm run db:postgres`)
because the Prisma schema is parity-safe: no enums, no scalar lists. Custom
JWT auth stays — Supabase Auth solves a problem this product doesn't have.

**D10 — Graceful degradation everywhere.**
No Supabase env → in-process bus + local disk; dev works offline. Progress is
self-reported (spoiler gating is a courtesy rail among friends, not an
adversarial control).

## Design system

**D11 — Three typefaces, three voices.**
Cormorant Garamond (the library, display only), Crimson Pro (the book's
voice: quotes, prose), IBM Plex Sans (the tool's voice: chrome). Deliberately
bends the "two faces max" rule because a reading app genuinely has two
speakers. Self-hosted via next/font — no CDN, no silent fallback.

**D12 — Dark ground; paper is a material.**
The app is night-reading dark by default; the ONLY paper surface is a literal
page (the PDF, the landing manifesto). Light theme is a warm-paper inversion
of the same ink ramp — components adapt through tokens with zero edits.

**D13 — Vibe × theme token matrix.**
`data-vibe` (ember/tide/bloom/meadow) × `data-theme` (dark/light) on <html>,
stamped pre-paint from localStorage. The vibe changes accent + gradient only
— never content: highlight colours stay semantic, paper stays paper. Light
variants flip accents to deep values and `on-accent` to white so contrast
holds both ways. Gradients (`.bg-grad`/`.text-grad`) are rationed to primary
actions, progress, and the focus timer — calm-tech restraint. (RESEARCH §3, §7)

**D14 — No emoji as structural icons.**
One Lucide set, one stroke weight (1.75), size tokens, aria labels. Fill
carries state (star vs filled star), shape carries state where colour alone
would fail. Emoji in user content is fine — people type emoji.

**D15 — Nothing animates in a loop.**
Motion confirms or reveals; the only infinite animation permitted is a
loading spinner. `prefers-reduced-motion` collapses everything.

## Reference-driven consistency pass (from Readrise mockups)

**D18 — The reading surface is cream paper, theme-aware.**
The PDF page is warm cream (`--color-paper`), not stark white: `#fdfaf4`
(light) / `#f4ecdb` (dark, softer for night reading — calm-tech, RESEARCH §3).
pdf.js renders with `background: "transparent"` so the paper shows through
where the PDF paints none (the text-book case). PDFs that paint their own
white page can't be recoloured this way — accepted limitation. Paper stays
neutral-warm in every vibe: the accent colours chrome, never the page (D13).

**D19 — Stat rings show collective, accumulated work — never vanity.**
Extracted from the reference "My Progress" rings: streak, insights, books,
highlights. All are the circle's own totals; none is global, competitive, or
an engagement count. This is the loss-aversion mechanic made visible (the
Vault as the forest, RESEARCH §5). Numerals use the sans face with lining
tabular figures — data is the tool's voice (D11), and Cormorant's oldstyle
"1" reads as "I".

**D20 — Typographic book covers, not fake cover art.**
Books are uploaded PDFs with no artwork, so `BookCover` renders an honest
typographic cover: cream paper (the same material as the reading surface),
serif title, a spine coloured deterministically from the title. Carries the
"paper as material" identity onto the shelf.

### Reference elements deliberately NOT adopted
These appear in the Readrise mockups but contradict the thesis (D3) and were
held for the user's explicit decision, not silently added:
- **Global Pulse / Trending Circle / "500+ reading now" / Join trending** —
  discovery + engagement metrics + vanity counts. The anti-feed has none.
- **Circle Activity Feed as the home dashboard** — a feed is the thing being
  replaced. (Within-circle "who did what" already exists gently via Progress
  Match and check-ins; making it the centrepiece pushes toward engagement.)
- **Notifications bell** — the product ships zero notifications (calm-tech).
- **Heavy neon glow** — elite-ui flags "pure-black + neon web3 dark mode" as a
  default to avoid; our vibe gradients are the controlled version.

## The story landing (WebGL)

**D21 — The landing is a scroll-driven 3D story, not a pitch page.**
Five acts in one continuous react-three-fiber scene behind a ten-chapter HTML
overlay (`components/marketing/StoryScene.tsx` + `Overlay.tsx`): the feed →
the interrupt → the page → the circle → the rise. A primitive-built figure
straightens from doomscroll hunch to reading upright; the phone crossfades
into an open paper book; the friends are the app's own avatar colours; a
vault of books assembles in the finale. Craft rules that are load-bearing:
- **No model files, no remote HDRs** — drei Environment presets fetch over
  the network; a landing must not flicker offline. Primitives + instancing.
- **All scene colour flows from `lib/vibe-colors.ts`**, the WebGL mirror of
  the CSS token matrix (D13). Theme/vibe switches re-tint the scene live.
- **Held-object group**: phone/book/margin-note live in one group that stays
  between figure and camera and yaws to face it — otherwise side-on camera
  waypoints collapse the book into an unreadable slab.
- **Open-book angle ≤ ~0.45 rad**: past that the projection reads as a
  spine-first wedge, not a book.
- **Canvas at `z-0`, never negative z** — anything below z-0 paints behind
  the body background and is silently invisible (found the hard way).
- **Camera waypoints alternate sides** opposite each chapter's text column,
  so words and figure never fight for pixels. Damped scroll; reduced-motion
  collapses damping and idle bob into stills.
- Brand on the landing is **Readrise** (user's rename via their own mockups
  and antigravity edits).

## The character asset pipeline (Blender)

**D22 — Characters are the user's sculpt trilogy, processed by a scripted
Blender pipeline — never a manual session.**
`assets/white_mesh*.glb` are AI-generated scans of one kid at three
life-stages: standing doomscrolling → seated reading → two friends sharing a
book. `scripts/blender/build-characters.py` (run headless against the local
Blender 5.2) decimates 177k–784k tris to 30–48k, normalises scale/origin,
and exports colourless clay GLBs to `public/models/{scroller,reader,pair}.glb`
(~2.3MB total). Clay on purpose: runtime tinting through `lib/vibe-colors.ts`
keeps the vibe × theme matrix in charge. StoryScene crossfades the life-stages
instead of bending bones — more cinematic, zero rig complexity. The scans'
detached phone slab is made legible by parking the emissive screen-glow ON it.
Rejected: `Ch42_nonPBR.fbx` (photoreal Mixamo T-pose, 52MB, clashing
aesthetic) and the Kenney pack (CC0 but blocky game-art). Preview renders for
any future asset: `scripts/blender/preview-assets.py`.

**D23 — Characters are coloured by projecting the concept art into vertex
colours — no UVs, no texture files.**
The scans have no UVs, so `scripts/blender/colorize-characters.py` projects
each vertex along the model's front axis onto its concept art
(`assets/art/*.jpeg`, matched per model) and bakes the sampled pixel into
COLOR_0. Legit because every StoryScene camera waypoint shoots the front
hemisphere, and the scans were generated FROM this art so silhouettes align.
Materials stay `vertexColors: true` with WHITE colour — material.color
multiplies the paint, so tinting would muddy the outfits; the vibe reaches
characters through lighting only. Three bugs found by rendering, not
reasoning (diag scripts preserved): the front axis is -Y not the assumed
45° diagonal (art sheared across depth); Blender's `img.pixels` returns
sRGB-encoded floats that must be linearised or everything washes to pastel;
and re-runs must strip stale colour attributes or COLOR_0 is shadowed.
Known limit: content occluded in the art (chest behind the book) samples its
occluder — invisible at scene staging distance, and fixable only by manual
painting.

## Public circles: governance (D24–D27)

**D24 — Going public needs UNANIMITY, not turnout.**
Publishing retroactively exposes every highlight and thread members wrote
while the circle was private, so a member who objects must be able to stop it
alone: one "no" rejects immediately, and silence is never consent (an
un-voted member leaves the motion open forever). Any member may propose — it's
a circle decision, not an owner decree — and the proposer's yes is recorded on
creation. Resolution recomputes from LIVE membership so someone joining or
leaving mid-vote can't strand a proposal. Guarded by
`scripts/verify-publish-vote.ts`, which asserts all three rules against the
real DB.

**D25 — The admin IS the owner.** Publishing doesn't mint a new role; the
creator keeps `role: "owner"` and gains moderation powers once `isPublic`.
One concept, one check (`requireCircleAdmin`). Permissions are always derived
server-side — e.g. the reader page computes `canShoutout` from
`isPublic && role === "owner"` and passes it down; the client never asserts
its own rights.

**D26 — A removal is a ban, and requires a written reason.**
`ModerationAction` is audit log and ban list in one: deleting the Membership
alone would let a removed member walk straight back in through a public
circle's open join door, so `assertNotBanned` gates joining. The reason is
mandatory — the admin here is a peer, not staff, and moderation without a
recorded justification is how small communities turn arbitrary.

**D27 — Ranking rewards reading, not presence.**
Score = pages×w₁ + highlights×w₂ + discussion×w₃, with admin-tunable weights
(0–10, and the board can be switched off entirely). Nothing counts logins,
streaks, or time-on-site — that would rebuild the engagement bait the product
exists to replace. The three inputs are shown beside every score because a
rank you can't account for reads as arbitrary. Profile standing aggregates
PUBLIC circles only; surfacing private-circle activity through a profile badge
would break the privacy promise the product rests on.

**D28 — Invites: a rotatable code plus a link that survives sign-up.**
The code is always visible to every member (copy the code, or copy an invite
link); rotation is owner-only and confirmed, because generating a new one
silently kills every link already shared — a consequence that must be stated
before the click, not discovered after. Rotation retries on the `@unique`
collision rather than 500-ing.

`/join/[code]` exists because the real case is pasting a link to someone who
has no account yet: it shows a logged-out visitor WHICH circle invited them,
then hands off to sign-in carrying `?next=/join/CODE` so the code survives the
round trip. Only same-origin `next` paths are honoured (an open redirect is a
phishing gift), and the ban check from D26 is enforced here too — a shared
link must not be a back door for a removed member.

Two bugs the build and browser caught, both worth remembering:
- `useSearchParams()` in a client-component page forces a Suspense boundary
  during static prerender and **fails the build**. Reading the param at submit
  time from `window.location` keeps `/login` static.
- `router.push()` after joining serves the dashboard from the client Router
  Cache, so a freshly joined circle wouldn't appear behind you — needs an
  explicit `router.refresh()`.

## Focus mode (the research feature)

**D16 — Deliberate entry is the pattern interrupt.**
Focus is a named action, not an ambient state — the one-sec mechanism placed
at intent-formation. While active: sidebar gone, Progress Match gone (other
people are periphery; periphery leaves during deep work), highlights don't
auto-open threads. (RESEARCH §3, §4)

**D17 — The recap reports what was built.**
Minutes, pages, highlights — gradient numerals, "Built, not spent." No guilt
metrics, no comparison, no return hook. Session end is a feature. (§5, §6)

## Reading goals (D28–D30)

**D28 — The goal belongs to the Document, set by the uploader.**
Fields live on `Document` (`goalDays`, `goalStartedAt`, `goalRitual`), not on a
per-user join table. The person who brought the book to the circle is the one
who made the commitment, so it surfaces on *their* home. A per-reader goal is a
defensible future extension, but it would have shipped a table nobody had asked
for; this ships the feature the user described. `goalDays: null` — no deadline
— stays a first-class choice with its own control.

**D29 — The clock starts at upload, not at first open.**
A book sitting unopened for a week is precisely the state a goal exists to make
visible. Starting the clock lazily at first open would hide the most useful
signal the feature has.

**D30 — Falling behind is never rendered as failure.**
The single hardest constraint here, and it comes from research, not taste:
guilt is the dominant reason readers abandon books mid-way (RESEARCH §8), so a
tracker that scolds manufactures the outcome it exists to prevent. Therefore:
"behind" is neutral-coloured and labelled "Catching up"; the headline states
the daily number that *still works* rather than the shortfall; past the
deadline the copy offers more days instead of a verdict; the time-vs-pages gap
is shown on the bar rather than narrated. `lib/reading-goal.test.ts` asserts
the copy against a banned-word list so this survives future refactors — the
framing is load-bearing, not decoration.

## Process learnings (bugs worth remembering)

- **B1** `weekOf()` mixed local getters with `Date.UTC()` — Sunday-night
  check-ins east of UTC broke streaks. Caught by a test, not by reading.
- **B2** A callback in a render-effect's deps, recreated by the parent every
  render → unbounded canvas re-rasterization that wedged the browser. Fix:
  ref-held callback, excluded from deps.
- **B3** Seed approximated Helvetica at 0.5em/char; it's proportional — marks
  drifted right of their text, looking exactly like an anchoring bug. Fix:
  real AFM width tables.
- **B4** The blueprint demo hardcoded its own coordinates and mis-highlighted
  its own example — in a document arguing "measure, don't guess." Fix: the
  demo now runs the production algorithm on a live span.
