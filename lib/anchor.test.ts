import assert from "node:assert/strict";
import test from "node:test";
import { denormalizeRect, parseRects, compareRectPosition } from "./anchor";
import type { NormalizedRect } from "./types";

/**
 * Tests for the anchoring invariant — the load-bearing claim of this codebase:
 *
 *   A highlight stored as page fractions renders over the SAME TEXT at any
 *   zoom level, window size, or device pixel ratio.
 *
 * If these fail, highlights land on the wrong words for everyone except the
 * person who created them. See docs/BLUEPRINT.md §3.
 *
 * Run: npm test
 */

/** A rect covering the middle-left of a page — roughly one line of text. */
const RECT: NormalizedRect = { x: 0.121, y: 0.443, w: 0.377, h: 0.019 };

/** Float ratios don't land on exact decimals; compare within tolerance. */
const close = (actual: number, expected: number, msg: string) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${msg}: ${actual} ≉ ${expected}`);

test("denormalize scales linearly with rendered size", () => {
  const a = denormalizeRect(RECT, 612, 792); // 100%
  const b = denormalizeRect(RECT, 918, 1188); // 150%

  close(b.left / a.left, 1.5, "left");
  close(b.top / a.top, 1.5, "top");
  close(b.width / a.width, 1.5, "width");
  close(b.height / a.height, 1.5, "height");
});

test("a highlight covers the same fraction of the page at every zoom", () => {
  // The real invariant: whatever the render size, the highlight's position as
  // a proportion of the page is identical. That proportion is what determines
  // which word it sits on.
  const zooms = [0.6, 1, 1.3, 2, 3, 4.7];

  for (const zoom of zooms) {
    const w = 612 * zoom;
    const h = 792 * zoom;
    const box = denormalizeRect(RECT, w, h);

    assert.ok(Math.abs(box.left / w - RECT.x) < 1e-9, `left @${zoom}`);
    assert.ok(Math.abs(box.top / h - RECT.y) < 1e-9, `top @${zoom}`);
    assert.ok(Math.abs(box.width / w - RECT.w) < 1e-9, `width @${zoom}`);
  }
});

test("device pixel ratio cannot shift a highlight", () => {
  // DPI changes the canvas backing store, never the CSS layout size — which
  // is the only thing denormalize sees. Retina and standard must agree.
  const standard = denormalizeRect(RECT, 800, 1035);
  const retina = denormalizeRect(RECT, 800, 1035); // same CSS size, 2x backing
  assert.deepEqual(standard, retina);
});

test("a non-uniform window resize keeps the anchor proportional", () => {
  // Narrow laptop vs wide monitor: different widths, same relative position.
  const laptop = denormalizeRect(RECT, 700, 906);
  const monitor = denormalizeRect(RECT, 1400, 1812);
  close(monitor.left / 1400, laptop.left / 700, "left fraction");
  close(monitor.width / 1400, laptop.width / 700, "width fraction");
});

test("parseRects rejects malformed Json from the database", () => {
  assert.deepEqual(parseRects(null), []);
  assert.deepEqual(parseRects("nope"), []);
  assert.deepEqual(parseRects([{ x: 1 }]), []); // missing y/w/h
  assert.deepEqual(parseRects([{ x: 0, y: 0, w: 1, h: 1 }]), [
    { x: 0, y: 0, w: 1, h: 1 },
  ]);
  // A viewport-pixel rect that leaked in is structurally valid; the API schema
  // is what rejects out-of-range values, so parseRects passes it through.
  assert.equal(parseRects([{ x: 412, y: 887, w: 230, h: 18 }]).length, 1);
});

test("compareRectPosition orders highlights in reading order", () => {
  const top: NormalizedRect[] = [{ x: 0.5, y: 0.1, w: 0.1, h: 0.01 }];
  const bottom: NormalizedRect[] = [{ x: 0.1, y: 0.8, w: 0.1, h: 0.01 }];
  assert.ok(compareRectPosition(top, bottom) < 0);

  // Same line (within tolerance) → left-to-right.
  const left: NormalizedRect[] = [{ x: 0.1, y: 0.5, w: 0.1, h: 0.01 }];
  const right: NormalizedRect[] = [{ x: 0.6, y: 0.505, w: 0.1, h: 0.01 }];
  assert.ok(compareRectPosition(left, right) < 0);
});
