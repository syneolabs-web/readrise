import assert from "node:assert/strict";
import test from "node:test";
import { weekOf, slugify, initials, truncate, generateInviteCode } from "./utils";

test("weekOf buckets to the Monday of that week", () => {
  // 2026-07-15 is a Wednesday → Monday is 2026-07-13.
  assert.equal(weekOf(new Date("2026-07-15T12:00:00Z")), "2026-07-13");
  // Monday maps to itself.
  assert.equal(weekOf(new Date("2026-07-13T00:00:00Z")), "2026-07-13");
  // Sunday belongs to the week that STARTED — the classic off-by-one, since
  // getUTCDay() calls Sunday 0.
  assert.equal(weekOf(new Date("2026-07-19T23:00:00Z")), "2026-07-13");
  // The next Monday starts a new bucket.
  assert.equal(weekOf(new Date("2026-07-20T00:00:00Z")), "2026-07-20");
});

test("weekOf is stable across times of day", () => {
  const morning = weekOf(new Date("2026-07-15T00:30:00Z"));
  const night = weekOf(new Date("2026-07-15T23:30:00Z"));
  assert.equal(morning, night);
});

test("slugify produces url-safe circle slugs", () => {
  assert.equal(slugify("Growth Mindset"), "growth-mindset");
  assert.equal(slugify("  Book Club!! 2026  "), "book-club-2026");
  assert.equal(slugify("—"), "");
});

test("initials handles one and many names", () => {
  assert.equal(initials("Pratik"), "P");
  assert.equal(initials("Maya Chen"), "MC");
  assert.equal(initials("a b c d"), "AB"); // capped at two
});

test("truncate only cuts when needed", () => {
  assert.equal(truncate("short", 10), "short");
  assert.equal(truncate("abcdefghij", 5), "abcd…");
});

test("invite codes avoid ambiguous characters", () => {
  // These get read aloud and typed by hand; O/0 and I/1 cause failed joins.
  for (let i = 0; i < 200; i++) {
    assert.ok(!/[O0I1]/.test(generateInviteCode()));
  }
  assert.equal(generateInviteCode().length, 8);
});
