/**
 * Helvetica / Helvetica-Bold advance widths, in 1000-unit em space.
 *
 * From the Adobe AFM metrics for the PDF standard-14 fonts. These are exact,
 * not estimates — a viewer laying out Helvetica uses precisely these numbers.
 *
 * Why this file exists: the seed computes highlight rects for text IT
 * generated, and an "average character width" estimate drifts badly across a
 * line because Helvetica is proportional ('I' is 278, 'm' is 833). The result
 * is seeded highlights that sit a few characters right of their real text,
 * which looks exactly like an anchoring bug even though the engine is fine.
 * Measuring properly removes the ambiguity.
 *
 * Seed/build only — never shipped to the client.
 */

// prettier-ignore
const REGULAR: Record<string, number> = {
  " ": 278, "!": 278, '"': 355, "#": 556, $: 556, "%": 889, "&": 667, "'": 191,
  "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278,
  "0": 556, "1": 556, "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556,
  "8": 556, "9": 556, ":": 278, ";": 278, "<": 584, "=": 584, ">": 584, "?": 556,
  "@": 1015, A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722,
  I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, "[": 278,
  "\\": 278, "]": 278, "^": 469, _: 556, "`": 333, a: 556, b: 556, c: 500,
  d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222,
  m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556,
  v: 500, w: 722, x: 500, y: 500, z: 500, "{": 334, "|": 260, "}": 334, "~": 584,
};

// prettier-ignore
const BOLD: Record<string, number> = {
  " ": 278, "!": 333, '"': 474, "#": 556, $: 556, "%": 889, "&": 722, "'": 238,
  "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278,
  "0": 556, "1": 556, "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556,
  "8": 556, "9": 556, ":": 333, ";": 333, "<": 584, "=": 584, ">": 584, "?": 611,
  "@": 975, A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722,
  I: 278, J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, "[": 333,
  "\\": 278, "]": 333, "^": 584, _: 556, "`": 333, a: 556, b: 611, c: 556,
  d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278,
  m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333, u: 611,
  v: 556, w: 778, x: 556, y: 556, z: 500, "{": 389, "|": 280, "}": 389, "~": 584,
};

/** Width of one character in points at the given size. */
export function charWidth(ch: string, fontSize: number, bold = false): number {
  const table = bold ? BOLD : REGULAR;
  return ((table[ch] ?? 556) / 1000) * fontSize;
}

/** Exact rendered width of a string in points. */
export function textWidth(text: string, fontSize: number, bold = false): number {
  let total = 0;
  for (const ch of text) total += charWidth(ch, fontSize, bold);
  return total;
}
