import { Avatar } from "@/components/ui";
import { IconFlame, IconBookOpen, IconHighlighter, IconUsers, IconCalendar, IconSparkles } from "@/components/icons";

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    avatarImage: string | null;
    createdAt?: Date;
  };
  stats: {
    streak: number;
    highlights: number;
    books: number;
    circlesCount: number;
  };
};

export function ProfileHero({ user, stats }: Props) {
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "October 2026";

  // Derive an honest reader archetype from actual reading activity
  const getPersona = () => {
    if (stats.streak >= 4) return { label: "Habit Master", desc: "Unbroken weekly reflection" };
    if (stats.highlights >= 15) return { label: "Margin Scholar", desc: "Prolific passage annotator" };
    if (stats.books >= 3) return { label: "Deep Reader", desc: "Multivolume explorer" };
    if (stats.circlesCount >= 2) return { label: "Circle Catalyst", desc: "Collaborative reader" };
    return { label: "Pioneer Member", desc: "Foundational reading member" };
  };

  const persona = getPersona();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-6 sm:p-8 shadow-sm">
      {/* Theme-reactive ambient accent aura */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-series/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left: Avatar + Identity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <Avatar
              name={user.name}
              color={user.avatarColor}
              image={user.avatarImage}
              size={80}
              className="ring-4 ring-ink-950 shadow-md"
            />
            <span
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-series text-series-ink shadow-xs ring-2 ring-ink-900"
              title={persona.label}
            >
              <IconSparkles size={11} />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="cover-label rounded-full bg-ink-850 border border-ink-700/60 px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider text-accent">
                {persona.label}
              </span>
              <span className="inline-flex items-center gap-1 text-3xs text-ink-500">
                <IconCalendar size={11} />
                <span>Joined {joinDate}</span>
              </span>
            </div>

            <h1 className="cover-title mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-100">
              {user.name}
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-ink-400 font-mono">
              {user.email}
            </p>
          </div>
        </div>

        {/* Right: Quick Stat Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-ink-800/70 pt-4 md:border-t-0 md:pt-0">
          <div className="flex items-center gap-2.5 rounded-2xl border border-ink-800/70 bg-ink-950/40 px-3.5 py-2.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <IconUsers size={16} />
            </div>
            <div>
              <span className="cover-label block text-sm font-bold text-ink-100">
                {stats.circlesCount}
              </span>
              <span className="text-3xs text-ink-400">
                {stats.circlesCount === 1 ? "Circle" : "Circles"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-ink-800/70 bg-ink-950/40 px-3.5 py-2.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-series/10 text-series">
              <IconFlame size={16} />
            </div>
            <div>
              <span className="cover-label block text-sm font-bold text-ink-100">
                {stats.streak} <span className="text-3xs font-normal text-ink-400">wks</span>
              </span>
              <span className="text-3xs text-ink-400">
                Streak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-ink-800/70 bg-ink-950/40 px-3.5 py-2.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <IconHighlighter size={16} />
            </div>
            <div>
              <span className="cover-label block text-sm font-bold text-ink-100">
                {stats.highlights}
              </span>
              <span className="text-3xs text-ink-400">
                Notes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
