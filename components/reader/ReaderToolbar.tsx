"use client";

import Link from "next/link";
import { Avatar, Button } from "@/components/ui";
import { IconBack, IconFocus, IconMinus, IconPlus } from "@/components/icons";
import { ThemeMenu } from "@/components/ThemeMenu";
import type { MemberProgress } from "./types";

/** m:ss for the focus timer. */
function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The running head: what a printed book carries across the top of every
 * page — the title, where you are — and nothing that competes with the text.
 *
 * Progress Match lives here rather than on a settings page: seeing that your
 * friend is 40 pages ahead is only motivating if you see it while reading.
 *
 * On a phone the bar used to be 442px of controls in a 390px screen: the page
 * counter and theme menu were cut off and the title collapsed to nothing.
 * Now the title always keeps its line, zoom and the friends' positions
 * appear from `sm`/`md` up, and Focus shrinks to its icon.
 *
 * Under the bar, one rule in the series colour shows how far into the book
 * you are — the same "show, don't narrate" progress as everywhere else.
 */
export function ReaderToolbar({
  title,
  author,
  circleSlug,
  currentPage,
  pageCount,
  scale,
  onScale,
  onJump,
  members,
  viewerId,
  focus,
  elapsed,
  onStartFocus,
  onEndFocus,
}: {
  title: string;
  author: string | null;
  circleSlug: string;
  currentPage: number;
  pageCount: number;
  scale: number;
  onScale: (s: number) => void;
  onJump: (page: number) => void;
  members: MemberProgress[];
  viewerId: string;
  focus: boolean;
  elapsed: number;
  onStartFocus: () => void;
  onEndFocus: () => void;
}) {
  const sorted = [...members].sort((a, b) => b.currentPage - a.currentPage);
  const pct = pageCount ? Math.min(100, (currentPage / pageCount) * 100) : 0;

  return (
    <header className="relative z-20 shrink-0 border-b border-ink-800 bg-ink-950">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <Link
          href={`/circles/${circleSlug}`}
          aria-label="Back to the circle"
          className="cover-label inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ink-300 transition-colors duration-[120ms] hover:bg-ink-850 hover:text-ink-100"
        >
          <IconBack size={15} />
          <span className="hidden sm:inline">Circle</span>
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="cover-label truncate text-sm font-bold text-ink-100">{title}</h1>
          {author && <p className="truncate text-2xs text-ink-500">{author}</p>}
        </div>

        {/* ── Progress Match ─────────────────────────────────
            Not rendered during focus: other people's positions are periphery,
            and periphery leaves the room when deep work starts (RESEARCH §3). */}
        {!focus && (
          <div className="hidden items-center gap-2.5 border-r border-ink-800 pr-4 md:flex">
            {sorted.map((m) => {
              const p = pageCount ? (m.currentPage / pageCount) * 100 : 0;
              const me = m.id === viewerId;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5"
                  title={`${me ? "You" : m.name} — page ${m.currentPage} of ${pageCount}`}
                >
                  <Avatar
                    name={m.name}
                    color={m.avatarColor}
                    size={22}
                    className={me ? "ring-2 ring-accent ring-offset-1 ring-offset-ink-950" : ""}
                  />
                  <div className="h-1 w-9 bg-ink-800">
                    <div
                      className="h-full [transition:width_var(--dur-state)_var(--ease-out)]"
                      style={{ width: `${p}%`, background: m.avatarColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Focus session ──────────────────────────────── */}
        {focus ? (
          <div className="flex shrink-0 items-center gap-2">
            {/* The one inked element on this bar while a session runs. */}
            <span className="fig inline-flex items-center gap-1.5 rounded-full bg-series px-3 py-1.5 text-xs font-bold text-series-ink shadow-sm">
              <IconFocus size={13} />
              {fmt(elapsed)}
            </span>
            <Button variant="outline" size="sm" onClick={onEndFocus}>
              End<span className="hidden sm:inline">&nbsp;session</span>
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onStartFocus}
            aria-label="Start a focus session"
            className="shrink-0"
          >
            <IconFocus size={14} />
            <span className="hidden sm:inline">Focus</span>
          </Button>
        )}

        {/* Zoom is the live proof that anchoring is resolution-independent:
            highlights track the text at every scale. Phones pinch instead. */}
        <div className="hidden shrink-0 items-center sm:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onScale(Math.max(0.6, +(scale - 0.15).toFixed(2)))}
            aria-label="Zoom out"
          >
            <IconMinus size={14} />
          </Button>
          <span className="fig w-10 text-center text-2xs text-ink-500">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onScale(Math.min(3, +(scale + 0.15).toFixed(2)))}
            aria-label="Zoom in"
          >
            <IconPlus size={14} />
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = new FormData(e.currentTarget).get("page");
            const page = Number(input);
            if (page >= 1 && page <= pageCount) onJump(page);
          }}
          className="flex shrink-0 items-center gap-1"
        >
          <input
            name="page"
            key={currentPage}
            defaultValue={currentPage}
            inputMode="numeric"
            aria-label={`Page number, of ${pageCount}`}
            className="fig h-8 w-11 rounded-lg border border-ink-700/80 bg-ink-900/90 px-1 text-center text-xs text-ink-100 focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none"
          />
          <span className="fig text-xs text-ink-500">/{pageCount}</span>
        </form>

        {/* Kept on phones: switching to dark pages is a night-reading need. */}
        <ThemeMenu />
      </div>

      {/* Where you are in the book, as one printed rule. */}
      <div
        className="absolute inset-x-0 -bottom-px h-[3px] bg-transparent"
        role="progressbar"
        aria-label="Your place in the book"
        aria-valuemin={1}
        aria-valuemax={pageCount}
        aria-valuenow={currentPage}
      >
        <div
          className="h-full bg-series [transition:width_var(--dur-state)_var(--ease-out)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  );
}
