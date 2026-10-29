import { IconFlame, IconHighlighter, IconStarFilled, IconBookOpen, IconCheckCircle } from "@/components/icons";

type Props = {
  progress: {
    streak: number;
    highlights: number;
    insights: number;
    books: number;
  };
};

export function ProfileBentoStats({ progress }: Props) {
  const cards = [
    {
      id: "streak",
      title: "Reading Streak",
      value: progress.streak,
      unit: "weeks",
      sub: progress.streak > 0 ? "Unbroken weekly practice" : "Starts with this week's chapter",
      icon: IconFlame,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      borderGlow: "hover:border-amber-500/40",
      tag: progress.streak > 0 ? `${progress.streak}w Active` : "Kickstart",
    },
    {
      id: "highlights",
      title: "Margin Highlights",
      value: progress.highlights,
      unit: progress.highlights === 1 ? "note" : "notes",
      sub: "Passages marked on the original text",
      icon: IconHighlighter,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      borderGlow: "hover:border-accent/40",
      tag: "Deep Focus",
    },
    {
      id: "vault",
      title: "In The Vault",
      value: progress.insights,
      unit: progress.insights === 1 ? "synthesis" : "syntheses",
      sub: "Reflections pinned to circle second brains",
      icon: IconStarFilled,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-400/10",
      borderGlow: "hover:border-yellow-400/40",
      tag: "Knowledge Base",
    },
    {
      id: "books",
      title: "Volumes Explored",
      value: progress.books,
      unit: progress.books === 1 ? "volume" : "volumes",
      sub: "Shared books opened across circles",
      icon: IconBookOpen,
      iconColor: "text-series",
      iconBg: "bg-series/10",
      borderGlow: "hover:border-series/40",
      tag: "Shelf Progress",
    },
  ];

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${c.borderGlow}`}
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-center justify-between">
              <span className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-400">
                {c.title}
              </span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${c.iconBg} ${c.iconColor}`}>
                <Icon size={14} />
              </div>
            </div>

            {/* Middle: Big Stat Number */}
            <div className="my-3 flex items-baseline gap-1.5">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-100">
                {c.value}
              </span>
              <span className="text-xs font-semibold text-ink-500">
                {c.unit}
              </span>
            </div>

            {/* Bottom Row: Microcopy + Tag */}
            <div className="border-t border-ink-800/60 pt-2.5 flex items-center justify-between gap-2">
              <p className="truncate text-3xs text-ink-400">
                {c.sub}
              </p>
              <span className="shrink-0 rounded-md bg-ink-850 px-1.5 py-0.5 text-4xs font-bold uppercase tracking-wider text-ink-400">
                {c.tag}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
