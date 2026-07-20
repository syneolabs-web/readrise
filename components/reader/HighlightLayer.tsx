"use client";

import { useEffect, useRef, useState } from "react";
import { denormalizeRect } from "@/lib/anchor";
import { COLOR_STYLES, type NormalizedRect } from "@/lib/types";
import { initials, relativeTime } from "@/lib/utils";
import type { HighlightDTO } from "@/lib/serialize";

/**
 * Paints stored highlights onto a rendered page.
 *
 * Rendering is a pure multiply against the CURRENT page size — the payoff for
 * storing normalized rects. Zoom, resize and DPI need no handling because the
 * stored value never knew about the screen. See docs/BLUEPRINT.md §3.
 *
 * POINTER MODEL — the non-obvious part:
 * pdf.js's text layer sits ABOVE this layer (z-2 vs z-1) because selecting text
 * must keep working over an existing highlight. That means these rects can
 * never receive mouse events, no matter what pointer-events says: the text
 * layer is on top and hit-tests first.
 *
 * So the marks stay pure paint, and hover/click are resolved by hit-testing the
 * cursor against the stored geometry on the page container instead. Selection
 * and annotation then coexist rather than compete for the same pixels.
 */
export function HighlightLayer({
  highlights,
  width,
  height,
  activeId,
  onSelect,
}: {
  highlights: HighlightDTO[];
  width: number;
  height: number;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Keep the latest data out of the effect's deps so the listeners aren't
  // torn down and rebuilt on every realtime refetch.
  const state = useRef({ highlights, width, height, onSelect });
  state.current = { highlights, width, height, onSelect };

  // NOTE: this component must never early-return before the root renders, or
  // this effect finds no parent on mount and — with empty deps — never retries.
  // The root is always rendered; only its contents are gated on measurement.
  useEffect(() => {
    const page = rootRef.current?.parentElement;
    if (!page) return;

    /** The topmost highlight under the cursor, in page-fraction space. */
    const hit = (e: MouseEvent): HighlightDTO | null => {
      const { highlights } = state.current;
      const box = page.getBoundingClientRect();
      if (!box.width || !box.height) return null;
      const x = (e.clientX - box.left) / box.width;
      const y = (e.clientY - box.top) / box.height;
      // Reverse order so the most recent mark wins where two overlap.
      for (let i = highlights.length - 1; i >= 0; i--) {
        const h = highlights[i]!;
        if (h.rects.some((r) => contains(r, x, y))) return h;
      }
      return null;
    };

    const onMove = (e: MouseEvent) => {
      const h = hit(e);
      setHovered((prev) => (prev === (h?.id ?? null) ? prev : (h?.id ?? null)));
    };

    const onLeave = () => setHovered(null);

    const onClick = (e: MouseEvent) => {
      // A drag that selected text is an annotation gesture, not a click on an
      // existing mark — don't hijack it.
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      const h = hit(e);
      if (h) state.current.onSelect(h.id);
    };

    page.addEventListener("mousemove", onMove);
    page.addEventListener("mouseleave", onLeave);
    page.addEventListener("click", onClick);
    return () => {
      page.removeEventListener("mousemove", onMove);
      page.removeEventListener("mouseleave", onLeave);
      page.removeEventListener("click", onClick);
    };
  }, []);

  const measured = width > 0 && height > 0;
  const hoveredHighlight = highlights.find((h) => h.id === hovered) ?? null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {measured &&
        highlights.map((h) => {
          const style = COLOR_STYLES[h.color] ?? COLOR_STYLES.yellow;
          const active = activeId === h.id;
          const lit = active || hovered === h.id;

          return (
            <div key={h.id}>
              {h.rects.map((r, i) => {
                const box = denormalizeRect(r, width, height);
                return (
                  <div
                    key={i}
                    className="absolute transition-all duration-[120ms]"
                    style={{
                      left: box.left,
                      top: box.top,
                      width: box.width,
                      height: box.height,
                      background: style.fill,
                      borderRadius: 2,
                      boxShadow: lit ? `0 0 0 2px ${style.ring}` : undefined,
                      filter: active ? "saturate(1.5)" : undefined,
                    }}
                  />
                );
              })}

              {/* Reply count, pinned to the first rect. Raised above the text
                  layer because it's a discrete control sitting in the margin,
                  where it can't shadow a meaningful amount of selectable text. */}
              {h.comments.length > 0 && h.rects[0] && (
                <button
                  onClick={() => onSelect(h.id)}
                  aria-label={`${h.comments.length} ${
                    h.comments.length === 1 ? "reply" : "replies"
                  } on “${h.textContent.slice(0, 40)}”`}
                  className="pointer-events-auto absolute flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-2xs font-bold text-on-accent shadow-md transition-transform duration-[120ms] hover:scale-110"
                  style={{
                    zIndex: 3,
                    background: style.solid,
                    left: denormalizeRect(h.rects[0], width, height).left - 7,
                    top: denormalizeRect(h.rects[0], width, height).top - 7,
                  }}
                >
                  {h.comments.length}
                </button>
              )}
            </div>
          );
        })}

      {/* Attribution, floated just above the mark. The ambient answer to
          "who marked this?" — it must never cost a click, and never cover the
          sentence it describes. */}
      {measured && hoveredHighlight?.rects[0] && (
        <Attribution
          key={hoveredHighlight.id}
          author={hoveredHighlight.author}
          createdAt={hoveredHighlight.createdAt}
          replies={hoveredHighlight.comments.length}
          accent={
            (COLOR_STYLES[hoveredHighlight.color] ?? COLOR_STYLES.yellow).solid
          }
          box={denormalizeRect(hoveredHighlight.rects[0], width, height)}
          pageWidth={width}
        />
      )}
    </div>
  );
}

function contains(r: NormalizedRect, x: number, y: number) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function Attribution({
  author,
  createdAt,
  replies,
  accent,
  box,
  pageWidth,
}: {
  author: { name: string; avatarColor: string };
  createdAt: string;
  replies: number;
  accent: string;
  box: { left: number; top: number; width: number; height: number };
  pageWidth: number;
}) {
  const ESTIMATED_W = 190;
  // Keep the chip on the page instead of letting it hang off the edge.
  const left = Math.max(4, Math.min(box.left, pageWidth - ESTIMATED_W - 4));
  // Above the mark by default; below when the mark is at the very top, so the
  // chip never covers the line it describes.
  const above = box.top > 30;

  return (
    <div
      className="animate-fade-up pointer-events-none absolute whitespace-nowrap"
      style={{
        left,
        top: above ? box.top - 27 : box.top + box.height + 6,
        zIndex: 5, // above the text layer, or selection would clip it
      }}
    >
      <div
        className="flex items-center gap-1.5 rounded-md border border-ink-700 bg-ink-950/95 px-2 py-1 shadow-lg shadow-black/50"
        style={{ borderLeftColor: accent, borderLeftWidth: 2 }}
      >
        <span
          className="grid h-3.5 w-3.5 place-items-center rounded-full text-[8px] font-bold text-on-accent"
          style={{ background: author.avatarColor }}
        >
          {initials(author.name)}
        </span>
        <span className="text-2xs font-medium text-ink-200">{author.name}</span>
        <span className="text-2xs text-ink-600">{relativeTime(createdAt)}</span>
        {replies > 0 && (
          <span className="text-2xs text-ink-600">
            · {replies} {replies === 1 ? "reply" : "replies"}
          </span>
        )}
      </div>
    </div>
  );
}
