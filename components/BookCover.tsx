import { truncate } from "@/lib/utils";

/**
 * A tactile literary book cover for reader PDFs:
 * - Real spine gradient shadow & embossed fold
 * - Deckle edge simulated paper thickness on the right
 * - Archival paper with fine debossed framing border
 * - Literata literary serif typography
 * - Dynamic foil gleam & 3D tilt on hover
 */
const SERIES = [
  { band: "bg-series-orange", ribbon: "bg-amber-400", ink: "text-[var(--series-orange-ink)]", tag: "Vol. I" },
  { band: "bg-series-blue", ribbon: "bg-blue-400", ink: "text-[var(--series-blue-ink)]", tag: "Vol. II" },
  { band: "bg-series-cerise", ribbon: "bg-rose-400", ink: "text-[var(--series-cerise-ink)]", tag: "Vol. III" },
  { band: "bg-series-green", ribbon: "bg-emerald-400", ink: "text-[var(--series-green-ink)]", tag: "Vol. IV" },
] as const;

export function seriesFor(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return SERIES[h % SERIES.length]!;
}

export function BookCover({
  title,
  author,
  width = 52,
  className = "",
}: {
  title: string;
  author?: string | null;
  width?: number;
  className?: string;
}) {
  const s = seriesFor(title);
  const height = Math.round(width * 1.52);
  const big = width >= 75;
  const medium = width >= 50;

  return (
    <div
      className={`group relative flex shrink-0 flex-col overflow-hidden rounded-xl bg-[#fbf7ee] dark:bg-[#1b1815] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.38),0_2px_6px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:rotate-[-1deg] hover:shadow-[0_20px_35px_-10px_rgba(0,0,0,0.45)] select-none ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* ── Real Book Spine Depth ── */}
      <span className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 left-1.5 z-20 w-px bg-white/20" />

      {/* ── Fanned Page Stack (Right Edge) ── */}
      <span className="pointer-events-none absolute inset-y-1 right-0 z-10 w-1 bg-amber-100/60 border-l border-black/10" />

      {/* ── Silk Bookmark Ribbon ── */}
      {big && (
        <span
          className={`pointer-events-none absolute -top-1 right-3 z-30 h-4.5 w-1.5 rounded-b-2xs shadow-xs transition-transform duration-200 group-hover:translate-y-1 ${s.ribbon}`}
        />
      )}

      {/* ── Diagonal Foil Sheen Sweep on Hover ── */}
      <span className="pointer-events-none absolute -inset-full z-30 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />

      {/* ── Top Archival Band ── */}
      <div
        className={`${s.band} ${s.ink} relative flex shrink-0 items-center justify-between px-2`}
        style={{ height: height * 0.18 }}
      >
        <span
          className="font-bold tracking-widest uppercase opacity-90 truncate"
          style={{ fontSize: Math.max(6, width * 0.08) }}
        >
          Readrise
        </span>
        {big && (
          <span
            className="font-mono text-3xs font-semibold opacity-80"
            style={{ fontSize: Math.max(6, width * 0.07) }}
          >
            {s.tag}
          </span>
        )}
      </div>

      {/* ── Central Literary Paper Frame ── */}
      <div className="relative flex flex-1 flex-col justify-between p-1.5 sm:p-2 border-y border-amber-900/10 dark:border-white/10">
        {/* Subtle debossed blind-stamp inner box */}
        <div className="flex h-full w-full flex-col justify-center rounded-sm border border-dashed border-amber-900/15 dark:border-white/10 px-2 py-1 text-center">
          <span
            className="font-prose font-semibold italic text-paper-ink tracking-tight leading-tight block line-clamp-3"
            style={{
              fontSize: Math.max(8.5, width * (big ? 0.13 : 0.15)),
            }}
          >
            {truncate(title, big ? 42 : 24)}
          </span>

          {author && medium && (
            <span
              className="mt-1 block font-sans uppercase tracking-wider text-paper-ink/70 line-clamp-1"
              style={{ fontSize: Math.max(6.5, width * 0.075) }}
            >
              {truncate(author, 24)}
            </span>
          )}
        </div>
      </div>

      {/* ── Foot Band ── */}
      <div
        className={`${s.band} ${s.ink} shrink-0 px-2 flex items-center justify-center`}
        style={{ height: height * 0.13 }}
      >
        <span
          className="h-0.5 w-6 rounded-full bg-white/40"
        />
      </div>
    </div>
  );
}
