# Readrise — design system

**The Reading Ledger.** The world for every signed-in surface: dashboard,
circle, discover, profile, and the reader's chrome. The marketing route group
keeps its own scroll narrative and is out of scope here.

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
| Instrument | **Archivo** | Body, labels, chrome, and every figure |
| Atlas register | **Archivo Narrow** | Column heads, plate captions, page titles |
| The book's voice | **Literata** | Quoted passages, highlights, prose the book owns |

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

### Two token vocabularies, deliberately separated

`--color-paper` is the **book's page material** — cream, and it stays cream on
a dark ground (D13). `--color-surface` is the **page background** of the
landing and auth routes. These previously collided on one name, which made
every book cover and the PDF page near-black in dark theme. They are different
concepts and now have different names.

## Structure

- **Plate, not card.** Regions are bounded by a hairline at `radius-md` on a
  `bg-ink-900/60` ground. The old 12px radius and raised fill made every region
  read as a floating tile; in an atlas the regions are pages of one document,
  so the ground stays continuous.
- **Ruled rows** (`.ruled`) are the structural unit for lists. A hairline
  between rows, not a gap and a shadow.
- **The masthead is the record.** Every index surface opens with an edition
  line (name · date) and headline figures, before any navigation or greeting.
  A dashboard that opens with a greeting has spent its best strip on chrome.
- **Plate captions** (`.plate-label`) name a quantity in tracked Archivo Narrow
  caps. They are deliberately quieter than the figure they introduce.
- **The reader's own row** (`.self-row`) is the one place the accent appears in
  a data context, which is what makes it findable at a glance.

Geometry: measures are squared off, not pill-shaped. A rounded cap makes the
reading ambiguous at exactly the ends where precision matters.

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
