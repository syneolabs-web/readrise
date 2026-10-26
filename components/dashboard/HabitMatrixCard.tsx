import Link from "next/link";
import { Avatar } from "@/components/ui";
import { CheckinButton } from "@/components/CheckinButton";
import { IconCheckCircle, IconTarget, IconArrow } from "@/components/icons";

type Habit = {
  id: string;
  title: string;
  circle: { name: string; slug: string };
  members: { id: string; name: string; avatarColor: string }[];
  checked: string[];
};

type Props = {
  habits: Habit[];
  userId: string;
  firstCircleSlug?: string;
};

export function HabitMatrixCard({ habits, userId, firstCircleSlug }: Props) {
  if (habits.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-ink-800/70 pb-2.5">
          <div className="flex items-center gap-2">
            <IconTarget size={15} className="text-accent" />
            <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-400">
              Weekly Habit
            </h3>
          </div>

          <span className="rounded-full bg-ink-850 px-2 py-0.5 text-3xs font-semibold text-ink-400">
            Pending
          </span>
        </div>

        <p className="mt-2.5 text-xs leading-relaxed text-ink-400">
          No habit set this week. Agree on one concrete practice from your current chapter:
        </p>

        {/* Suggestion List */}
        <div className="mt-2.5 space-y-1.5">
          <div className="rounded-xl border border-ink-800 bg-ink-950/40 p-2 text-xs text-ink-300">
            <span className="font-bold text-ink-100">Paced Reading:</span> 20 pages before Sunday.
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-950/40 p-2 text-xs text-ink-300">
            <span className="font-bold text-ink-100">Margin Dialogue:</span> Leave 1 reflection on a note.
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-950/40 p-2 text-xs text-ink-300">
            <span className="font-bold text-ink-100">Real Action:</span> Test 1 idea in your routine.
          </div>
        </div>

        {firstCircleSlug && (
          <div className="mt-3.5 border-t border-ink-800/70 pt-3">
            <Link
              href={`/circles/${firstCircleSlug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-series px-4 py-2 text-xs font-bold text-series-ink shadow-sm hover:brightness-105 transition-all"
            >
              <span>Propose Habit for Circle</span>
              <IconArrow size={12} />
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-ink-800/70 pb-2.5">
        <div className="flex items-center gap-2">
          <IconCheckCircle size={15} className="text-accent" />
          <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-400">
            This Week&apos;s Habits
          </h3>
        </div>

        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-3xs font-semibold text-emerald-500 dark:text-emerald-400">
          Active
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {habits.map((h) => {
          const isDone = h.checked.includes(userId);
          const ratio = h.members.length > 0 ? (h.checked.length / h.members.length) * 100 : 0;

          return (
            <div
              key={h.id}
              className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-3 transition-all hover:border-ink-600"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-accent truncate max-w-[130px]">
                  {h.circle.name}
                </span>
                <span className="text-3xs text-ink-500 shrink-0">
                  {h.checked.length}/{h.members.length} done
                </span>
              </div>

              <p className="cover-label mt-1 text-xs sm:text-sm font-bold leading-snug text-ink-100">
                {h.title}
              </p>

              {/* Progress bar */}
              <div className="mt-2 h-1 w-full rounded-full bg-ink-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${ratio}%` }}
                />
              </div>

              {/* Footer with avatars & checkin */}
              <div className="mt-2.5 flex items-center justify-between gap-2.5">
                <div className="flex -space-x-1.5">
                  {h.members.map((m) => {
                    const did = h.checked.includes(m.id);
                    return (
                      <Avatar
                        key={m.id}
                        name={`${m.name} — ${did ? "done" : "pending"}`}
                        color={m.avatarColor}
                        size={20}
                        className={`ring-2 ring-ink-950 ${did ? "ring-emerald-500" : "opacity-35 grayscale"}`}
                      />
                    );
                  })}
                </div>

                <CheckinButton actionId={h.id} done={isDone} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
