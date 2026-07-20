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
          className={`shrink-0 text-2xs font-semibold uppercase tracking-[0.12em] ${tone.className}`}
        >
          {tone.label}
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
        {goal.headline}
      </p>

      {/* Pages read (the fill) against time elapsed (the marker). Fill behind
          the marker IS "behind" — shown, not stated. The marker sits on the
          track rather than under it, and is tall enough to read at a glance;
          floating it below reads as an unrelated speck. */}
      <div className="relative mt-3 h-2 rounded-full bg-ink-800">
        <div
          className="bg-grad h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
        <span
          // Ringed in the card's own background so it stays legible whether it
          // lands on the filled gradient or the empty track.
          className="absolute -top-0.5 h-3 w-0.5 -translate-x-1/2 rounded-full bg-ink-400 ring-2 ring-ink-900"
          style={{ left: `${Math.min(100, goal.timeElapsed * 100)}%` }}
          title={`${Math.round(goal.timeElapsed * 100)}% of your ${goal.totalDays} days used`}
          aria-hidden
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-2xs tabular-nums text-ink-500">
        <span>
          p{page} / {pageCount}
        </span>
        <span>
          {goal.status === "overdue"
            ? `${goal.totalDays} day goal`
            : `${goal.daysLeft} ${goal.daysLeft === 1 ? "day" : "days"} left`}
        </span>
      </div>

      {goal.ritual && (
        <p className="mt-2 border-t border-ink-800 pt-2 text-2xs italic text-ink-400">
          “{goal.ritual}”
        </p>
      )}
    </Card>
  );
}
