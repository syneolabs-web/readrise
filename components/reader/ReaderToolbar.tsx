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
 * Progress Match lives here rather than on a settings page: seeing that your
 * friend is 40 pages ahead is only motivating if you see it while reading.
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

  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-4 border-b border-ink-800 bg-ink-950 px-4">
      <Link
        href={`/circles/${circleSlug}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-sm text-xs text-ink-500 transition-colors duration-[120ms] hover:text-ink-200"
      >
        <IconBack size={13} />
        Circle
      </Link>

      <div className="min-w-0 shrink">
        <h1 className="truncate text-sm font-medium text-ink-100">{title}</h1>
        {author && <p className="truncate text-2xs text-ink-600">{author}</p>}
      </div>

      {/* ── Focus session ──────────────────────────────── */}
      <div className="ml-auto flex items-center gap-2">
        {focus ? (
          <>
            {/* The one inked element on this bar while a session runs. Solid, not
                a gradient: a gradient on a running clock implies the colour
                means something, and it does not. */}
            <span className="fig inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-on-accent">
              <IconFocus size={13} />
              {fmt(elapsed)}
            </span>
            <Button variant="outline" size="sm" onClick={onEndFocus}>
              End session
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onStartFocus}>
            <IconFocus size={13} />
            Focus
          </Button>
        )}
      </div>

      {/* ── Progress Match ─────────────────────────────────
          Not rendered during focus: other people's positions are periphery,
          and periphery leaves the room when deep work starts (RESEARCH §3). */}
      {!focus && (
      <div className="hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2">
          {sorted.map((m) => {
            const pct = pageCount ? (m.currentPage / pageCount) * 100 : 0;
            return (
              <div
                key={m.id}
                className="group relative flex items-center gap-1.5"
                title={`${m.name} — page ${m.currentPage} of ${pageCount}`}
              >
                <Avatar
                  name={m.name}
                  color={m.avatarColor}
                  size={22}
                  className={m.id === viewerId ? "ring-2 ring-accent" : ""}
                />
                <div className="h-1 w-10 bg-ink-800">
                  <div
                    className="h-full [transition:width_var(--dur-state)_var(--ease-out)]"
                    style={{ width: `${pct}%`, background: m.avatarColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-5 w-px bg-ink-800" />
      </div>
      )}

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onScale(Math.max(0.6, +(scale - 0.15).toFixed(2)))}
          aria-label="Zoom out"
        >
          <IconMinus size={14} />
        </Button>
        {/* Zoom is the live proof that anchoring is resolution-independent:
            highlights track the text at every scale. */}
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

        <div className="mx-1 h-5 w-px bg-ink-800" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = new FormData(e.currentTarget).get("page");
            const page = Number(input);
            if (page >= 1 && page <= pageCount) onJump(page);
          }}
          className="flex items-center gap-1"
        >
          <input
            name="page"
            key={currentPage}
            defaultValue={currentPage}
            aria-label="Page number"
            className="fig w-10 rounded-sm border border-ink-800 bg-ink-900 px-1 py-0.5 text-center text-xs text-ink-200 focus:border-accent/50 focus:outline-none"
          />
          <span className="fig text-xs text-ink-600">/ {pageCount}</span>
        </form>

        <div className="mx-1 h-5 w-px bg-ink-800" />
        <ThemeMenu />
      </div>
    </header>
  );
}
