import Link from "next/link";
import { Card } from "@/components/ui";
import { IconFlame } from "@/components/icons";
import type { getPublicStanding } from "@/lib/circle-governance";

/**
 * A member's standing across the PUBLIC circles they belong to.
 *
 * Private-circle activity is deliberately absent: leaking it through a
 * profile badge would break the privacy promise the product rests on. If
 * someone is only in private circles, this renders nothing at all.
 */
export function PublicStanding({
  standing,
}: {
  standing: Awaited<ReturnType<typeof getPublicStanding>>;
}) {
  if (!standing.tier || standing.entries.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
        Public activity
      </h2>
      <Card className="mt-3 p-4">
        <div className="flex items-center gap-2">
          <span className="text-accent">
            <IconFlame size={15} />
          </span>
          <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-accent">
            {standing.tier}
          </span>
          <span className="text-xs text-ink-500">
            {standing.totalScore} points across{" "}
            {standing.circles === 1 ? "1 public circle" : `${standing.circles} public circles`}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          {standing.entries.map((e) => (
            <Link
              key={e.circleSlug}
              href={`/circles/${e.circleSlug}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors duration-[120ms] hover:bg-ink-850"
            >
              <span className="font-semibold tabular-nums text-ink-200">
                #{e.rank}
              </span>
              <span className="text-ink-600">of {e.of}</span>
              <span className="truncate text-ink-300">{e.circleName}</span>
              <span className="ml-auto shrink-0 tabular-nums text-ink-600">
                {e.score}
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </section>
  );
}
