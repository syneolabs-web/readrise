import Link from "next/link";
import { IconHighlighter, IconArrow, IconBookOpen } from "@/components/icons";

type HighlightItem = {
  id: string;
  textContent: string;
  pageNumber: number;
  color: string;
  createdAt: Date;
  document: {
    id: string;
    title: string;
    author: string | null;
    circle: { name: string; slug: string };
  };
};

type Props = {
  highlights: HighlightItem[];
};

export function ProfileNotebook({ highlights }: Props) {
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    yellow: { border: "border-amber-400/30", bg: "bg-amber-400/5", text: "text-amber-300" },
    green: { border: "border-emerald-400/30", bg: "bg-emerald-400/5", text: "text-emerald-300" },
    blue: { border: "border-sky-400/30", bg: "bg-sky-400/5", text: "text-sky-300" },
    pink: { border: "border-rose-400/30", bg: "bg-rose-400/5", text: "text-rose-300" },
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <IconHighlighter size={16} />
          </div>
          <div>
            <h3 className="cover-label text-sm sm:text-base font-bold text-ink-100">
              Reader&apos;s Commonplace Notebook
            </h3>
            <p className="text-3xs sm:text-xs text-ink-400">
              Passages you preserved while reading across all your circles
            </p>
          </div>
        </div>

        <span className="rounded-full bg-ink-850 px-2.5 py-1 text-3xs font-semibold text-ink-300 border border-ink-800">
          Recent Annotations
        </span>
      </div>

      {/* Highlights List */}
      {highlights.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-800 bg-ink-950/30 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-850 text-ink-400">
            <IconHighlighter size={20} />
          </div>
          <h4 className="cover-title mt-3 text-base font-bold text-ink-200">
            Your notebook is waiting for its first quote
          </h4>
          <p className="mt-1 max-w-md text-xs text-ink-400">
            Select any resonant passage while reading in your circles. Your highlights, margin notes, and insights will be saved here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {highlights.map((h) => {
            const styling = colorMap[h.color] || colorMap.yellow!;

            return (
              <Link
                key={h.id}
                href={`/read/${h.document.id}`}
                prefetch={false}
                className="group relative flex flex-col justify-between rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-850/60 shadow-xs"
              >
                <div>
                  {/* Origin Metainfo */}
                  <div className="flex items-center justify-between gap-2 text-3xs">
                    <span className="cover-label font-bold text-accent truncate">
                      {h.document.circle.name}
                    </span>
                    <span className="rounded-md bg-ink-850 px-1.5 py-0.5 font-mono text-ink-400">
                      p. {h.pageNumber}
                    </span>
                  </div>

                  {/* Quoted Text */}
                  <blockquote
                    className={`mt-2.5 border-l-2 ${styling.border} pl-3 py-0.5 font-prose text-xs sm:text-sm italic leading-relaxed text-ink-200 group-hover:text-ink-100 transition-colors line-clamp-3`}
                  >
                    &ldquo;{h.textContent}&rdquo;
                  </blockquote>
                </div>

                {/* Footer: Volume Title + Arrow */}
                <div className="mt-3.5 flex items-center justify-between border-t border-ink-800/60 pt-2.5 text-3xs">
                  <div className="flex items-center gap-1.5 text-ink-400 truncate">
                    <IconBookOpen size={11} className="shrink-0" />
                    <span className="truncate">{h.document.title}</span>
                  </div>

                  <span className="flex items-center gap-1 font-semibold text-ink-500 group-hover:text-ink-200 transition-colors">
                    <span>Jump to page</span>
                    <IconArrow size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
