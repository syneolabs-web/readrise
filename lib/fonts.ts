import { Archivo, Archivo_Narrow, Literata } from "next/font/google";

/**
 * Two voices, three faces.
 *
 * The atlas voice (Archivo, Archivo Narrow) is the instrument: labels, column
 * heads, and every number. Archivo is a grotesque drawn for high legibility at
 * small sizes with genuine tabular figures — the requirement the whole world
 * rests on, because a column of numbers that shifts as it updates is not a
 * table, it is a rumour. Archivo Narrow carries dense label rows and column
 * heads; the condensed cut is what separates an atlas from a dashboard.
 *
 * The book's voice (Literata) is the reader's: quoted passages, highlights,
 * anything the book itself says. Drawn by TypeTogether for long-form screen
 * reading, so it holds up at paragraph length where a display serif would not.
 *
 * The faces this replaced — Cormorant Garamond, Crimson Pro, IBM Plex Sans —
 * are the exact set that every model reaches for when told "books" and "calm".
 * Legible, but the arrangement was recognisable as a default rather than as
 * this product.
 *
 * Self-hosted by next/font: no CDN request, no layout shift, no silent
 * fallback to the system stack.
 */

/** The instrument. Labels, chrome, and every figure in the product. */
export const ui = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

/** Column heads and dense label rows — the atlas's own register. */
export const display = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

/** The book's voice. Quoted prose, highlights, the page itself. */
export const prose = Literata({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-prose",
  display: "swap",
});

export const fontVars = `${display.variable} ${prose.variable} ${ui.variable}`;
