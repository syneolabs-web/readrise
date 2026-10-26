import Link from "next/link";
import type { GoalState } from "@/lib/reading-goal";
import { Card } from "@/components/ui";

/**
 * The uploader's own reading goal, on their home.
 *
 * Two rules this component exists to hold (see lib/reading-goal.ts for the
 * research):
 *
 * - Being behind is never coloured red and never worded as a shortfall. Red is
 *   an error state; falling behind on a book is not an error, and treating it
 *   as one is what makes people abandon the book entirely.
 * - The comparison bar shows *time elapsed* against *pages read*, so the
 *   reader can see the gap themselves without being told off about it.
 */

const TONE: Record<GoalState["status"], { label: string; className: string }> = {
  ahead: { label: "Ahead", className: "text-accent" },
  "on-track": { label: "On pace", className: "text-accent" },
  // Deliberately neutral, not a warning colour.
  behind: { label: "Catching up", className: "text-ink-300" },
  overdue: { label: "Past the date", className: "text-ink-300" },
  done: { label: "Finished", className: "text-accent" },
};

export function GoalCard({
  goal,
  documentId,
  title,
  page,
  pageCount,
}: {
  goal: GoalState;
  documentId: string;
  title: string;
  page: number;
  pageCount: number;
}) {
  const tone = TONE[goal.status];
  const pct = Math.round(goal.progress * 100);

  return (
    <Card className="p-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <Link
          href={`/read/${documentId}`}
          // min-w-0 is what actually lets `truncate` work here: without it the
          // flex item refuses to shrink below its text and pushes the card
          // wider than the viewport instead of ellipsising.
          className="min-w-0 truncate text-sm font-medium text-ink-100 transition-colors hover:text-accent"
        >
          {title}
        </Link>
        <span
          className={`plate-label shrink-0 ${tone.className}`}
        >
          {tone.label}
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
        {goal.headline}
      </p>

      {/* The three quantities that actually decide tonight, given equal weight
          and set as figures so they read across. Prose can only say one of
          them at a time; a row says all three and lets you pick. */}
      <div className="mt-3 grid grid-cols-3 gap-3 border-y border-ink-800 py-3">
        <div>
          <p className="fig text-xl font-semibold leading-none text-ink-100">
            {goal.paceNeeded}
          </p>
          <p className="plate-label mt-1">Pages/day</p>
        </div>
        <div>
          <p className="fig text-xl font-semibold leading-none text-ink-100">
            {goal.pagesLeft}
          </p>
          <p className="plate-label mt-1">To go</p>
        </div>
        <div>
          <p className="fig text-xl font-semibold leading-none text-ink-100">
            {goal.daysLeft}
          </p>
          <p className="plate-label mt-1">
            {goal.daysLeft === 1 ? "Day left" : "Days left"}
          </p>
        </div>
      </div>

      {/* Pages read (the fill) against time elapsed (the tick). Fill behind the
          tick IS "behind" — shown, never stated. Squared off rather than
          pill-shaped: this is a measure against a scale, and a rounded cap
          makes the reading ambiguous at exactly the ends where precision
          matters most. */}
      <div className="relative mt-3 h-2 rounded-full overflow-hidden bg-ink-800">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 shadow-sm"
          style={{ width: `${pct}%` }}
        />
        <span
          className="measure-tick"
          style={{ left: `${Math.min(100, goal.timeElapsed * 100)}%` }}
          title={`${Math.round(goal.timeElapsed * 100)}% of your ${goal.totalDays} days used`}
          aria-hidden
        />
      </div>

      <div className="fig mt-2 flex items-center justify-between text-2xs text-ink-500">
        <span>
          p{page} / {pageCount}
        </span>
        <span>{pct}% read</span>
      </div>

      {goal.ritual && (
        <p className="mt-2 border-t border-ink-800 pt-2 text-2xs italic text-ink-400">
          “{goal.ritual}”
        </p>
      )}
    </Card>
  );
}
