import { InviteCodeQuickJoin } from "./InviteCodeQuickJoin";
import { IconSparkles, IconUsers, IconBookOpen } from "@/components/icons";

export function DiscoverHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-6 sm:p-8 shadow-sm">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-series/10 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-center">
        {/* Left: Headline & Manifesto */}
        <div>
          <div className="flex items-center gap-2">
            <span className="cover-label rounded-full bg-accent/15 border border-accent/25 px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider text-accent">
              Global Pulse
            </span>
            <span className="text-3xs text-ink-500 font-semibold">
              Open Reading Rooms
            </span>
          </div>

          <h1 className="cover-title mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-100 max-w-xl">
            Find a circle reading something good.
          </h1>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-ink-300 max-w-xl">
            Small pods, real books, people reading with intent — not an algorithmic audience. Circles open up only when every member votes to, so this shelf fills slowly, on purpose.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-3xs text-ink-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Unanimous member consent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span>Full margin annotations open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-series" />
              <span>No algorithm feeds</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Invite Code Entry */}
        <div>
          <InviteCodeQuickJoin />
        </div>
      </div>
    </div>
  );
}
