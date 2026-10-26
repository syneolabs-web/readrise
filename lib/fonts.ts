import { Archivo, Literata } from "next/font/google";

/**
 * Two voices, two faces — one product from the landing to the reader.
 *
 * The instrument (Archivo, variable, width axis open) is the app's own voice:
 * labels, chrome, every number, and — set wide and heavy — every title. One
 * variable file replaces the three cuts this used to load (Archivo, Archivo
 * Narrow, and a landing-only wide Archivo): width is now a setting, not a
 * separate font. Titles use `.cover-title` / `font-display` (wide); body and
 * figures stay at normal width, where Archivo's tabular figures hold a column.
 *
 * The book's voice (Literata) is the reader's: quoted passages, highlights,
 * anything the book itself says. Drawn by TypeTogether for long-form screen
 * reading, so it holds up at paragraph length where a display serif would not.
 *
 * Self-hosted by next/font: no CDN request, no layout shift, no silent
 * fallback to the system stack.
 */
export const ui = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-ui",
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

export const fontVars = `${prose.variable} ${ui.variable}`;
