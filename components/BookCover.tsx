import { truncate } from "@/lib/utils";

/**
 * A typographic book cover, printed as a series paperback: a colour band,
 * the paper band carrying the title, a colour band at the foot.
 *
 * Our books are uploaded PDFs with no artwork, so the cover is honest
 * typography (D20) — now in the same grammar as the landing's shelf, so a
 * book on your dashboard looks like the books on the cover that brought you
 * here. The band colour is one of the four series colours, chosen
 * deterministically from the title, so a book keeps its colour everywhere it
 * appears. It is content colour, like a spine — not the viewer's vibe.
 */
const SERIES = [
  { band: "bg-series-orange", ink: "text-[var(--series-orange-ink)]" },
  { band: "bg-series-blue", ink: "text-[var(--series-blue-ink)]" },
  { band: "bg-series-cerise", ink: "text-[var(--series-cerise-ink)]" },
  { band: "bg-series-green", ink: "text-[var(--series-green-ink)]" },
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
}: {
  title: string;
  author?: string | null;
  width?: number;
}) {
  const s = seriesFor(title);
  const height = Math.round(width * 1.5);
  const big = width >= 80;

  return (
    <div
      className="relative flex shrink-0 flex-col overflow-hidden rounded-xl bg-paper shadow-[0_10px_22px_-8px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.1)] ring-1 ring-black/10 transition-transform duration-200 hover:scale-[1.03]"
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* spine shading, as on a real paperback */}
      <span className="absolute inset-y-0 left-0 z-10 w-[3px] bg-black/10" />
      <span className={`${s.band} block`} style={{ height: height * 0.2 }} />
      <span className="flex flex-1 flex-col justify-center px-[9%]">
        <span
          className="cover-title block text-paper-ink"
          style={{ fontSize: Math.max(7, width * (big ? 0.12 : 0.14)), lineHeight: 1 }}
        >
          {truncate(title, big ? 48 : 30)}
        </span>
        {author && big && (
          <span
            className="mt-1.5 block leading-tight text-paper-ink/60"
            style={{ fontSize: Math.max(6, width * 0.075) }}
          >
            {truncate(author, 28)}
          </span>
        )}
      </span>
      <span className={`${s.band} block`} style={{ height: height * 0.14 }} />
    </div>
  );
}
