"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconHighlighter } from "@/components/icons";
import { COLOR_STYLES, type HighlightColor } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";

/**
 * Appears over a fresh text selection.
 *
 * Shape: one primary action (the highlighter) plus a colour row. Clicking the
 * highlighter commits immediately in the active colour; clicking a colour
 * commits in that colour. Either way it's one click from selection to
 * highlight — the core gesture never costs two.
 *
 * Positioned in viewport (fixed) coordinates. These are throwaway UI values,
 * NOT the anchor — the anchor was normalized at capture time. Confusing the
 * two is the bug this codebase is designed around.
 */
export function SelectionPopover({
  anchor,
  text,
  colors,
  activeColor,
  onPickColor,
  onCommit,
  onDismiss,
}: {
  anchor: { x: number; y: number };
  text: string;
  colors: readonly HighlightColor[];
  activeColor: HighlightColor;
  onPickColor: (color: HighlightColor) => void;
  onCommit: (color: HighlightColor) => void;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: anchor.x, top: anchor.y });

  // Clamp inside the viewport so a selection near an edge stays reachable.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const pad = 8;
    setPos({
      left: Math.min(
        Math.max(pad + width / 2, anchor.x),
        window.innerWidth - width / 2 - pad
      ),
      // Flip below the selection if there's no room above.
      top: anchor.y - height - 10 < pad ? anchor.y + 24 : anchor.y - height - 10,
    });
  }, [anchor.x, anchor.y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
      // The gesture is muscle memory; Enter should finish it.
      if (e.key === "Enter") {
        e.preventDefault();
        onCommit(activeColor);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss, onCommit, activeColor]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Highlight this passage"
      className="animate-fade-up fixed z-40 -translate-x-1/2 rounded-lg border border-ink-700 bg-ink-850 p-2 shadow-2xl shadow-black/60"
      style={{ left: pos.left, top: pos.top }}
      // The popover must not steal the selection it's acting on.
      onMouseDown={(e) => e.preventDefault()}
    >
      <p className="mb-2 max-w-[230px] px-1 font-prose text-xs leading-snug text-ink-500">
        &ldquo;{truncate(text, 72)}&rdquo;
      </p>

      <div className="flex items-center gap-1.5">
        {/* Primary action. One click: selection → highlight. */}
        <button
          onClick={() => onCommit(activeColor)}
          autoFocus
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-on-accent transition-transform duration-[120ms] hover:brightness-110 active:scale-95"
          style={{ background: COLOR_STYLES[activeColor].solid }}
        >
          <IconHighlighter size={13} />
          Highlight
        </button>

        <div className="mx-0.5 h-5 w-px bg-ink-700" aria-hidden="true" />

        {/* Colour row. Picking one commits in that colour. */}
        <div className="flex items-center gap-1" role="group" aria-label="Colour">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                onPickColor(c);
                onCommit(c);
              }}
              aria-label={`Highlight ${c}`}
              aria-pressed={c === activeColor}
              className={cn(
                "h-5 w-5 rounded-full transition-transform duration-[120ms]",
                "hover:scale-115 active:scale-95",
                c === activeColor && "ring-2 ring-ink-300 ring-offset-2 ring-offset-ink-850"
              )}
              style={{ background: COLOR_STYLES[c].solid }}
            />
          ))}
        </div>

        <button
          onClick={onDismiss}
          className="ml-1 rounded-sm px-1.5 text-2xs text-ink-500 transition-colors duration-[120ms] hover:text-ink-200"
        >
          Esc
        </button>
      </div>
    </div>
  );
}
