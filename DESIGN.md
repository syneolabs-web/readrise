# Readrise — design system

**One book, outside and in.** The landing is the cover (**The Paperback**,
last section of this file); every signed-in surface — home, circle, vault,
discover, profile, auth, the reader's chrome — is the pages inside it. Both
share one token set, one face, one wordmark. Inside, the Paperback's grammar
(series-colour bands, wide heavy titles, squared controls, the colophon) is
used at a quieter, denser scale, on top of the **Reading Ledger** discipline
below: ruled rows, tabular figures, captions quieter than their figures.

### Inside the book (signed-in surfaces) — what changed and why

- **Every page answers "what do I do now" first.** Home opens on tonight's
  book at your page with one Continue button; a circle opens on the book
  you're reading together beside this week's habit. Rare actions (rotate the
  invite code, start the go-public vote) live in a "Circle settings" section
  at the foot — except an *open* vote, which needs every member and leads.
- **The series colour is the one loud ink.** Primary buttons (`Button`
  primary, Continue, check-in done), the header's 3px top rule, the active
  nav underline (`AppNav`, `CircleNav`, `MobileNav`), the reader's progress
  rule. `text-accent` is the same hue tuned to read as text on the ground.
- **Section heads** are `SectionHead` (wide tracked caps over a ruled list),
  not cards. Lists are ruled rows; cards are kept only for genuinely bounded
  objects (goal card, modal, vote in progress).
- **Shared pieces:** `FriendsRail` (everyone's page on one rail, you ringed,
  fill up to you), `CheckinButton` (optimistic weekly check-in, reverts and
  says so on failure), `BookCover` (a mini series paperback, colour from the
  title), `AuthShell` (cover panel + form; keeps `?next=` across login/signup).
- **The reader's toolbar is a running head**: title always keeps its line,
  zoom and friends' positions appear from `sm`/`md`, Focus shrinks to an icon
  on phones, and a 3px series rule under it shows your place in the book.

## Thesis

Readrise is a record of a practice, so the record is the interface.

This world refuses the arrangement the category always ships — cream ground,
high-contrast display serif, soft cards floating in whitespace, terracotta
accent — and refuses that arrangement's predictable opposite, the near-black
focus app with one neon accent and glowing edges. What replaced it is a
**statistical atlas**: ruled rows, tabular figures, small multiples, marginal
captions. Density read as respect rather than as clutter.

The previous type stack was Cormorant Garamond + Crimson Pro + IBM Plex Sans —
three faces that are, precisely, what any model reaches for when told "books"
and "calm". Legible, but recognisable as a default rather than as this product.

## Type

| Role | Face | Use |
|---|---|---|
| Instrument | **Archivo** (variable, `wdth` axis) | Body, labels, chrome, and every figure, at normal width |
| Titles & captions | **Archivo set wide** — `.cover-title` (800, 118%), `.cover-label` (112%), `font-display` / `.plate-label` (112%) | Page titles, section heads, buttons, captions |
| The book's voice | **Literata** | Quoted passages, highlights, prose the book owns |

Archivo Narrow is retired: width is now a setting of the one variable face,
loaded once in the root layout. `.cover-title` / `.cover-label` live in
`@layer components` so utilities can still override them.

Rules:

- **Every number in the product is tabular.** Use `.fig` (or `Datum`, which
  applies it). A figure that changes width as it updates makes a column jitter,
  which is the difference between a table and a stack of unrelated numbers.
- **Nothing is below 12px.** `--text-2xs` was raised from 0.694rem (~11px),
  which was elegant on a 27" display and an accessibility failure on a laptop.
  Hierarchy comes from weight, tracking and colour, never from shrinking type
  past legibility.
- Prose faces are for what the *book* says. The app's own voice is Archivo.

## Colour

Strategy: **restrained** — a neutral ink ramp plus exactly one accent, which is
the user's own choice. This is not a default; it is forced by two facts. The
surface is read in a dim room at night, and the accent is user-selectable, so
it cannot be load-bearing for meaning.

**One data ink.** In any measure — progress bar, standings bar, sparkline — the
accent marks the reader's own series and nothing else. Everything else is the
reference grid in `ink-700`/`ink-800`. Gradients are banned inside measures: a
gradient encodes a second dimension that does not exist, and the eye asks what
the colour change means when the answer is "nothing".

Red is reserved for destructive actions and genuine errors. Falling behind on a
book is neither, and must never be rendered in it.

**The accent is the vibe's series colour** (orange / blue / cerise / green),
tuned per theme to read as text: ≥ 4.9:1 on light paper, ≥ 6:1 on the night
stock. Flat fills use the true series colour via `bg-series` /
`text-series-ink`. `.bg-grad` survives only as a flat alias.

**Text greys clear a floor.** On the ground, `ink-500` and up are ≥ 4.5:1 and
`ink-600` (meta captions only) ≥ 3.8:1; `ink-700` and below are rules and
tracks, never text. The old `ink-600` sat near 2:1 and carried timestamps.

### One token vocabulary (and the cream that stays cream)

`--color-paper` is the **book's page material** — cream, and it stays cream on
a dark ground (D13). The landing/auth names (`--paper`, `--ink`, `--ink-soft`,
`--rule`, `--cover-*`) are now pure **aliases of the one ink ramp**; they used
to carry their own values, so the auth pages and the app never quite matched
and on ember-dark the alias block even overrode the accent. New code uses the
`ink-*` ramp.

## Structure

- **Plate, not card.** Regions are bounded by a hairline at a 3px radius on a
  `bg-ink-900/60` ground (controls too: squared, `rounded-[3px]`). The old 12px radius and raised fill made every region
  read as a floating tile; in an atlas the regions are pages of one document,
  so the ground stays continuous.
- **Ruled rows** (`.ruled`) are the structural unit for lists. A hairline
  between rows, not a gap and a shadow.
- **The masthead is the next action.** Every index surface opens with an
  edition line (date · name) and then the thing you came to do — tonight's
  page, the book you're reading together — before the figures. (It used to
  open with figures; that put "Continue reading" below the fold on a phone.)
  A greeting is still chrome; the record still follows right after.
- **Plate captions** (`.plate-label`) name a quantity in tracked wide Archivo
  caps. They are deliberately quieter than the figure they introduce.
- **The reader's own row** (`.self-row`) is the one place the accent appears in
  a data context, which is what makes it findable at a glance.

Geometry: measures are squared off, not pill-shaped. A rounded cap makes the
reading ambiguous at exactly the ends where precision matters.

### One deliberate exception to the side-tab rule

A coloured left border on a **card** is the AI tell the detector names, and it
is banned. A left rule on a `<blockquote>` is not the same object: it is the
oldest typographic convention for quoted material, and here the border colour
*is* the highlight's colour, so it carries the one piece of information that
tells you how a passage was marked. The detector cannot tell a quotation from
a card and will keep flagging `ThreadPanel` and `VaultList`. Those two are
correct as they stand; anything else with a coloured side border is not.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Anything entering or exiting |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movement on screen |
| `--dur-press` | 140ms | Press feedback |
| `--dur-micro` | 120ms | Colour and border changes |
| `--dur-state` | 240ms | Panels, sheets, measures |

- **There is no `--ease-in` token, on purpose.** It delays initial movement —
  the exact moment the user is watching — so it feels sluggish at any duration.
- Every pressable surface confirms the press: `active:scale-[0.97]` on buttons,
  `.pressable` on card links. On a phone there is no hover, so without this a
  tap has no acknowledgement at all before navigation.
- Hover lift is gated behind `(hover: hover) and (pointer: fine)`. Touch
  devices synthesise hover on tap and it sticks after the finger lifts.
- Never `transition: all`. Name the properties.
- `prefers-reduced-motion` collapses transforms and animation globally.

## Constraints this world must satisfy

- **Eight combinations.** Four vibes × two themes, all through tokens. Never
  hardcode a hex. Verified in ember/tide/meadow across both themes.
- **Never shame the reader.** Behind-pace states are neutral-coloured and
  phrased as a reachable number. Enforced by `lib/reading-goal.test.ts`.
- Semantic colour is never the only signal; shape and figure carry state too.

## The Paperback — the landing's world (`app/(marketing)`, `components/landing`)

The landing is a mid-century series paperback you open: flat colour bands, a
paper band between them, wide heavy grotesk titles, hairline rules, a
colophon. It refuses the category's cream-and-serif "cosy books" page and its
near-black neon opposite.

**Colour — committed, flat, no gradients.** The four vibes ARE the four
series colours, so the visitor's vibe reprints the cover they're holding:

| Vibe | Series | Token | Ink on it |
|---|---|---|---|
| ember | orange | `--series-orange` `#f26a1b` | near-black |
| tide | blue | `--series-blue` `#1d5fa8` | white |
| bloom | cerise | `--series-cerise` `#c8255f` | white |
| meadow | green | `--series-green` `#12804a` | white |

`--series` / `--series-ink` resolve to the current vibe's pair; style with
`bg-series`, `text-series-ink`. Band colours are a material, like
`--color-paper`: they stay identical in dark and light. Only the paper band
flips (`--cover-paper`, `--cover-ink`, `--cover-ink-soft`, `--cover-rule`).
The shelf's covers use all four series colours as content, the way
`BookCover` spines do.

**Type.** `.cover-title` = Archivo variable at `wdth` 118, weight 800,
-0.035em, 0.92 leading (loaded only in the marketing layout as
`--font-cover`). `.cover-label` = the same face at `wdth` 112 for nav, labels
and buttons. Literata only for what a book says (quotes, the demo page).
Both classes live in `@layer components` so utilities can override them —
unlayered CSS silently beats every Tailwind utility.

**Components.** Buttons are squared (no radius), ink-on-paper or
ink-on-band, `active:scale-[0.97]`. Depth comes only from real offset shadows
under paper objects (notes, slips, covers). The colophon mark
(`ColophonMark`) is the sun-over-book in an oval cartouche, `currentColor`.

**Motion — one authored moment per section, never looping.**
- Cover: CSS-only entrance (bands print in, title lines rise, the word
  "together." gets highlighted) so it runs before hydration.
- Same hour: one series band rises through the picture, wiping night (the
  feed) into day (the circle). Scroll-scrubbed.
- How a circle works: pinned; scroll turns six chapters on a real Walden page
  (highlight → margin → habit slip → check-in → vault). On phones the layers
  take turns instead of stacking.
- Strikes, counters and cover reveals fire once on entry.
`useReducedMotion` collapses every scroll transform; the global
reduced-motion rule collapses the CSS entrance.

**Honesty rules.** Demo people (Maya, Dev) are illustrative; book quotes are
public domain; the "121 hours / 20 books" figure is arithmetic with the
working shown, not a product metric. No user counts, testimonials or claims
the product can't back.
