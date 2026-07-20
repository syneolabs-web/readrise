import { Cormorant_Garamond, Crimson_Pro, IBM_Plex_Sans } from "next/font/google";

/**
 * Three faces, three distinct jobs. A reading app genuinely has two voices —
 * the book's and the tool's — and they must not sound the same.
 *
 * Self-hosted by next/font: no CDN request, no layout shift, no silent
 * fallback to the system stack.
 */

/** The library. Display only — never below 24px. */
export const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/** The book's voice. Quoted prose, highlights, the page itself. */
export const prose = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-prose",
  display: "swap",
});

/** The tool's voice. Buttons, labels, chrome — anything the app says. */
export const ui = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const fontVars = `${display.variable} ${prose.variable} ${ui.variable}`;
