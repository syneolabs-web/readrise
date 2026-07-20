import assert from "node:assert/strict";
import test from "node:test";
import { computeGoal, suggestGoalDays } from "./reading-goal";

/**
 * Guards for the reading-goal maths and — just as importantly — its framing.
 *
 * The framing assertions are not decoration: the research says guilt is what
 * makes readers abandon a book mid-way, so "behind" must never be phrased as a
 * shortfall or a failure. A future refactor that "improves" the copy into
 * something scolding should fail CI.
 */

const start = new Date("2026-07-01T00:00:00Z");

function goal(over: Partial<Parameters<typeof computeGoal>[0]> = {}) {
  return computeGoal(
    {
      pageCount: 200,
      goalDays: 10,
      goalStartedAt: start,
      goalRitual: null,
      currentPage: 1,
      ...over,
    },
    new Date("2026-07-06T00:00:00Z") // day 5 of 10 — halfway through the window
  );
}

test("no goal set returns null", () => {
  assert.equal(goal({ goalDays: null }), null);
  assert.equal(goal({ goalStartedAt: null }), null);
});

test("pace is recomputed from the days actually left", () => {
  // 150 pages left, 5 days left -> 30/day, not the original 20/day plan.
  const g = goal({ currentPage: 50 })!;
  assert.equal(g.daysLeft, 5);
  assert.equal(g.pagesLeft, 150);
  assert.equal(g.paceNeeded, 30);
  assert.equal(g.pacePlanned, 20);
});

test("status tracks progress against time elapsed", () => {
  assert.equal(goal({ currentPage: 150 })!.status, "ahead"); // 75% read, 50% time
  assert.equal(goal({ currentPage: 100 })!.status, "on-track"); // 50% / 50%
  assert.equal(goal({ currentPage: 20 })!.status, "behind"); // 10% / 50%
  assert.equal(goal({ currentPage: 200 })!.status, "done");
});

test("a finished book is done even after the deadline", () => {
  const g = computeGoal(
    {
      pageCount: 200,
      goalDays: 10,
      goalStartedAt: start,
      goalRitual: null,
      currentPage: 200,
    },
    new Date("2026-08-01T00:00:00Z")
  )!;
  assert.equal(g.status, "done");
  assert.equal(g.pagesLeft, 0);
});

test("past the deadline it offers more time, never a verdict", () => {
  const g = computeGoal(
    {
      pageCount: 200,
      goalDays: 10,
      goalStartedAt: start,
      goalRitual: null,
      currentPage: 40,
    },
    new Date("2026-07-20T00:00:00Z")
  )!;
  assert.equal(g.status, "overdue");
  assert.equal(g.daysLeft, 0);
  assert.match(g.headline, /more days/);
});

test("being behind is phrased as a reachable number, never a shortfall", () => {
  const g = goal({ currentPage: 20 })!;
  // States what WOULD work...
  assert.match(g.headline, /still finishes on time/);
  // ...and never shames. Guilt is what makes people quit (RESEARCH §8).
  for (const banned of [/behind/i, /fail/i, /missed/i, /should have/i, /only/i]) {
    assert.doesNotMatch(g.headline, banned);
  }
});

test("suggested days scale with length but stay sane at the extremes", () => {
  assert.equal(suggestGoalDays(200), 10); // ~20 pages/day
  assert.ok(suggestGoalDays(6) >= 3); // a pamphlet isn't a 1-day dare
  assert.ok(suggestGoalDays(5000) <= 120); // a doorstop isn't a year
  assert.equal(suggestGoalDays(0), 14); // unknown length -> a fortnight
});
