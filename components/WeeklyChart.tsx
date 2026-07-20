/**
 * A 7-day activity bar chart (highlights per day) — extracted from the
 * reference "My Progress" panel.
 *
 * Personal, not comparative: it's your own reading rhythm, which is the
 * time-well-spent framing (RESEARCH §6), not an engagement leaderboard. The
 * tallest day is emphasised with the vibe gradient; the rest stay quiet.
 */
export function WeeklyChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div>
      <div className="flex h-24 items-end justify-between gap-1.5">
        {data.map((d, i) => {
          const isPeak = d.count === max && d.count > 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <div
                  className={
                    isPeak
                      ? "bg-grad w-full rounded-sm"
                      : "w-full rounded-sm bg-ink-700"
                  }
                  style={{
                    height: `${(d.count / max) * 100}%`,
                    minHeight: d.count > 0 ? 4 : 2,
                    opacity: d.count > 0 ? 1 : 0.4,
                  }}
                />
              </div>
              <span className="text-2xs tabular-nums text-ink-600">
                {d.label[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
