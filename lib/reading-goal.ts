/**
 * Reading goals: "finish this book in N days".
 *
 * Design is driven by two research findings that pull in opposite directions
 * (docs/RESEARCH.md §8):
 *
 * 1. Specific, deadline-bound goals beat "do your best" ~90% of the time, and
 *    pace targets make the deadline actionable rather than abstract.
 * 2. BUT the dominant cause of abandoning a book mid-way is *guilt* — readers
 *    who feel behind quit rather than catch up. A tracker that scolds
 *    manufactures the exact outcome it's meant to prevent.
 *
 * So the maths is honest and the framing never is punitive: "behind" is
 * reported as a still-reachable daily number, and the primary escape hatch is
 * to move the deadline rather than to feel bad. A goal you rewrote is still a
 * goal; a goal that shamed you into closing the tab is not.
 */

export type GoalStatus = "ahead" | "on-track" | "behind" | "overdue" | "done";

export type GoalState = {
  /** Days the reader gave themselves. */
  totalDays: number;
  /** Whole days remaining; 0 once the deadline has passed. */
  daysLeft: number;
  targetDate: Date;
  pagesLeft: number;
  /** Pages/day needed from today to still land on time. */
  paceNeeded: number;
  /** Pages/day the original plan implied. */
  pacePlanned: number;
  /** 0..1 of the book actually read. */
  progress: number;
  /** 0..1 of the time window elapsed. */
  timeElapsed: number;
  status: GoalStatus;
  /** Second person, never scolding. */
  headline: string;
  ritual: string | null;
};

const DAY = 24 * 60 * 60 * 1000;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Midnight-aligned day difference, so "1 day left" doesn't flicker by hours. */
function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY);
}

export function computeGoal(doc: {
  pageCount: number;
  goalDays: number | null;
  goalStartedAt: Date | null;
  goalRitual: string | null;
  currentPage: number;
}, now = new Date()): GoalState | null {
  if (!doc.goalDays || !doc.goalStartedAt || doc.pageCount <= 0) return null;

  const start = doc.goalStartedAt;
  const targetDate = new Date(start.getTime() + doc.goalDays * DAY);
  const daysLeft = Math.max(0, daysBetween(now, targetDate));
  const elapsed = Math.min(doc.goalDays, Math.max(0, daysBetween(start, now)));

  const page = Math.min(doc.currentPage, doc.pageCount);
  const pagesLeft = Math.max(0, doc.pageCount - page);
  const progress = doc.pageCount > 0 ? page / doc.pageCount : 0;
  const timeElapsed = doc.goalDays > 0 ? elapsed / doc.goalDays : 1;

  const pacePlanned = Math.ceil(doc.pageCount / doc.goalDays);
  // Divide by the days actually remaining — the number that matters today,
  // not the number that mattered on day one.
  const paceNeeded = daysLeft > 0 ? Math.ceil(pagesLeft / daysLeft) : pagesLeft;

  let status: GoalStatus;
  let headline: string;

  if (pagesLeft === 0) {
    status = "done";
    headline = "Finished — that's the whole book.";
  } else if (daysLeft === 0) {
    status = "overdue";
    // No scolding, no red. Offer the fix, not the verdict.
    headline = `${plural(pagesLeft, "page")} past the date — give yourself more days?`;
  } else if (progress >= timeElapsed + 0.05) {
    status = "ahead";
    headline = `Ahead of pace — ${paceNeeded}/day keeps it that way.`;
  } else if (progress >= timeElapsed - 0.05) {
    status = "on-track";
    headline = `On pace — ${plural(paceNeeded, "page")} a day for ${plural(daysLeft, "more day")}.`;
  } else {
    status = "behind";
    // Deliberately states the reachable number rather than the shortfall.
    headline = `${plural(paceNeeded, "page")} a day still finishes on time.`;
  }

  return {
    totalDays: doc.goalDays,
    daysLeft,
    targetDate,
    pagesLeft,
    paceNeeded,
    pacePlanned,
    progress,
    timeElapsed,
    status,
    headline,
    ritual: doc.goalRitual,
  };
}

/**
 * A sensible default deadline for a book of this length.
 *
 * Anchored at ~20 pages/day — a real but unintimidating evening's reading —
 * then clamped so a pamphlet doesn't suggest 1 day and a doorstop doesn't
 * suggest a year. Research says goals should be challenging but attainable;
 * both extremes fail that test.
 */
export function suggestGoalDays(pageCount: number): number {
  if (pageCount <= 0) return 14;
  return Math.min(120, Math.max(3, Math.round(pageCount / 20)));
}
