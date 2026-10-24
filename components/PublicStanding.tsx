import Link from "next/link";
import { SectionHead } from "@/components/ui";
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
    <section aria-labelledby="public-standing">
      <SectionHead id="public-standing" title="In public circles" />
      <p className="mt-3 text-sm text-ink-400">
        <span className="cover-label rounded-[3px] bg-series px-2 py-0.5 text-xs font-bold text-series-ink">
          {standing.tier}
        </span>{" "}
        <span className="fig">{standing.totalScore}</span> points across{" "}
        {standing.circles === 1 ? "1 public circle" : `${standing.circles} public circles`}
      </p>
      <ul className="mt-3 border-t border-ink-800">
        {standing.entries.map((e) => (
          <li key={e.circleSlug} className="border-b border-ink-800">
            <Link href={`/circles/${e.circleSlug}`} className="group flex items-center gap-3 py-2.5 text-sm">
              <span className="fig cover-label w-10 font-bold text-ink-100">#{e.rank}</span>
              <span className="fig text-xs text-ink-500">of {e.of}</span>
              <span className="truncate text-ink-300 group-hover:text-ink-100 group-hover:underline">{e.circleName}</span>
              <span className="fig ml-auto shrink-0 text-xs text-ink-500">{e.score} pts</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
