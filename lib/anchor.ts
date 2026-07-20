import type { NormalizedRect } from "./types";

/**
 * Highlight anchoring math.
 *
 * The whole point: a highlight must NEVER store a viewport pixel. It stores
 * fractions of the PDF page's own coordinate space, so it renders correctly
 * at any zoom, window size, or device pixel ratio.
 *
 * See docs/BLUEPRINT.md §3 for why the naive getBoundingClientRect() approach
 * is a bug you ship without noticing.
 */

/** Browsers emit sub-pixel slivers on selections; below this they're noise. */
const MIN_AREA = 0.000002;

/**
 * Convert DOM selection rects into normalized page fractions.
 *
 * @param clientRects Raw rects from Range.getClientRects()
 * @param pageEl      The rendered page container, used as the origin
 */
export function normalizeRects(
  clientRects: DOMRect[],
  pageEl: HTMLElement
): NormalizedRect[] {
  const page = pageEl.getBoundingClientRect();
  if (page.width === 0 || page.height === 0) return [];

  const rects = clientRects
    .map((r) => ({
      // Offset by the page origin, then divide by rendered size. The
      // division is what erases zoom/DPI/window-size from the value.
      x: (r.left - page.left) / page.width,
      y: (r.top - page.top) / page.height,
      w: r.width / page.width,
      h: r.height / page.height,
    }))
    .filter((r) => r.w * r.h > MIN_AREA)
    .map(clampRect);

  return dedupeContained(rects);
}

/** Guard against selections dragged past the page edge. */
function clampRect(r: NormalizedRect): NormalizedRect {
  const x = Math.max(0, Math.min(1, r.x));
  const y = Math.max(0, Math.min(1, r.y));
  return {
    x,
    y,
    w: Math.max(0, Math.min(1 - x, r.w)),
    h: Math.max(0, Math.min(1 - y, r.h)),
  };
}

/**
 * Browsers frequently emit a rect per text node AND a wrapping rect covering
 * them. Painting both double-darkens the overlap, so drop any rect fully
 * contained by another.
 */
function dedupeContained(rects: NormalizedRect[]): NormalizedRect[] {
  return rects.filter((a, i) =>
    !rects.some((b, j) => i !== j && contains(b, a) && area(b) > area(a))
  );
}

const area = (r: NormalizedRect) => r.w * r.h;

function contains(outer: NormalizedRect, inner: NormalizedRect): boolean {
  const e = 0.0005; // tolerance for float jitter
  return (
    inner.x >= outer.x - e &&
    inner.y >= outer.y - e &&
    inner.x + inner.w <= outer.x + outer.w + e &&
    inner.y + inner.h <= outer.y + outer.h + e
  );
}

/**
 * The inverse: normalized fractions -> CSS pixels for the CURRENT render size.
 * A pure multiply, which is why zoom is free.
 */
export function denormalizeRect(
  r: NormalizedRect,
  renderedWidth: number,
  renderedHeight: number
) {
  return {
    left: r.x * renderedWidth,
    top: r.y * renderedHeight,
    width: r.w * renderedWidth,
    height: r.h * renderedHeight,
  };
}

/** Runtime guard — `rects` arrives from the DB as untyped Json. */
export function parseRects(value: unknown): NormalizedRect[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (r): r is NormalizedRect =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as NormalizedRect).x === "number" &&
      typeof (r as NormalizedRect).y === "number" &&
      typeof (r as NormalizedRect).w === "number" &&
      typeof (r as NormalizedRect).h === "number"
  );
}

/** Topmost-then-leftmost, so sidebar order matches reading order. */
export function compareRectPosition(a: NormalizedRect[], b: NormalizedRect[]) {
  const ay = a[0]?.y ?? 0;
  const by = b[0]?.y ?? 0;
  if (Math.abs(ay - by) > 0.01) return ay - by;
  return (a[0]?.x ?? 0) - (b[0]?.x ?? 0);
}

/**
 * Character offsets of a selection within the page's text layer.
 *
 * This is the *fallback* anchor. Geometry is fast but assumes the page renders
 * identically; text offsets survive a re-render that shifts layout. Storing
 * both is what Perusall and Hypothesis do, for the same reason.
 */
export function getTextOffsets(
  pageEl: HTMLElement,
  range: Range
): { start: number; end: number } {
  const layer = pageEl.querySelector(".textLayer");
  if (!layer) return { start: 0, end: 0 };

  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let start = -1;
  let end = -1;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const len = node.data.length;

    if (node === range.startContainer) start = offset + range.startOffset;
    if (node === range.endContainer) end = offset + range.endOffset;
    offset += len;
  }

  // A selection anchored to an element node rather than a text node (e.g. a
  // triple-click) won't match above; fall back to the plain text search.
  if (start === -1 || end === -1) {
    const text = layer.textContent ?? "";
    const selected = range.toString();
    const found = text.indexOf(selected);
    if (found === -1) return { start: 0, end: 0 };
    return { start: found, end: found + selected.length };
  }

  return start <= end ? { start, end } : { start: end, end: start };
}

/** The rendered page element a DOM node belongs to, if any. */
export function findPageElement(node: Node | null): HTMLElement | null {
  let el: HTMLElement | null =
    node instanceof HTMLElement ? node : (node?.parentElement ?? null);
  while (el && !el.hasAttribute("data-page-number")) el = el.parentElement;
  return el;
}
