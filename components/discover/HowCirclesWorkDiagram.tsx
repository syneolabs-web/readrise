import { IconLock, IconMessage, IconSparkles, IconCheckCircle, IconArrow } from "@/components/icons";

export function HowCirclesWorkDiagram() {
  const stages = [
    {
      num: "01",
      title: "Private Pod by Default",
      icon: IconLock,
      accent: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      description: "Start invite-only with 2–5 close friends. Upload any PDF book without public noise.",
    },
    {
      num: "02",
      title: "Paced Margin Debates",
      icon: IconMessage,
      accent: "text-accent bg-accent/10 border-accent/20",
      description: "Read in sync chapter by chapter. Highlight passages and leave threaded thoughts in context.",
    },
    {
      num: "03",
      title: "Unanimous Ballot to Open",
      icon: IconSparkles,
      accent: "text-series bg-series/10 border-series/20",
      description: "A single 'No' keeps the circle private. When all members agree, past insights open to Global Pulse.",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/70 pb-3.5">
        <div className="flex items-center gap-2">
          <IconSparkles size={15} className="text-accent" />
          <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-300">
            How Circles Reach The Global Pulse
          </h3>
        </div>
        <span className="text-3xs text-ink-500 font-semibold">
          3-Stage Democratic Reading
        </span>
      </div>

      <div className="mt-4 grid gap-3.5 md:grid-cols-3">
        {stages.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="relative flex flex-col justify-between rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4 transition-all duration-150 hover:border-ink-700 hover:bg-ink-850/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-500">
                    Phase {s.num}
                  </span>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-xl border ${s.accent}`}>
                    <Icon size={13} />
                  </div>
                </div>

                <h4 className="cover-label mt-3 text-xs sm:text-sm font-bold text-ink-100">
                  {s.title}
                </h4>

                <p className="mt-1.5 text-3xs leading-relaxed text-ink-400">
                  {s.description}
                </p>
              </div>

              {idx < 2 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-ink-600">
                  <IconArrow size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
