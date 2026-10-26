"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Vibe + theme picker.
 *
 * Personalisation is the honest autonomy lever (RESEARCH.md §7): the vibe
 * changes the chrome's accent and gradient — never content. Highlight colours
 * stay semantic, the paper stays paper. Four vibes, each tuned separately for
 * dark and light, persisted in localStorage and applied by the pre-paint
 * script in app/layout.tsx.
 */

// The four vibes are the four series colours the landing prints its covers
// in, so the swatch shows the exact flat colour you'll get.
const VIBES = [
  { id: "ember", label: "Orange", swatch: "bg-series-orange" },
  { id: "tide", label: "Blue", swatch: "bg-series-blue" },
  { id: "bloom", label: "Cerise", swatch: "bg-series-cerise" },
  { id: "meadow", label: "Green", swatch: "bg-series-green" },
] as const;

type Vibe = (typeof VIBES)[number]["id"];
type Theme = "dark" | "light";

function apply(theme: Theme, vibe: Vibe) {
  const d = document.documentElement;
  d.dataset.theme = theme;
  d.dataset.vibe = vibe;
  localStorage.setItem("pdx-theme", theme);
  localStorage.setItem("pdx-vibe", vibe);
}

export function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [vibe, setVibe] = useState<Vibe>("ember");
  const ref = useRef<HTMLDivElement>(null);

  // Read the truth the pre-paint script already stamped on <html>.
  useEffect(() => {
    const d = document.documentElement;
    setTheme(d.dataset.theme === "light" ? "light" : "dark");
    const v = d.dataset.vibe as Vibe;
    if (VIBES.some((x) => x.id === v)) setVibe(v);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function setThemeAndApply(t: Theme) {
    setTheme(t);
    apply(t, vibe);
  }
  function setVibeAndApply(v: Vibe) {
    setVibe(v);
    apply(theme, v);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Theme and vibe"
        className="grid h-7 w-7 place-items-center rounded-md text-ink-400 transition-colors duration-[120ms] hover:bg-ink-800 hover:text-ink-100"
      >
        <Palette size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <div className="animate-fade-up absolute right-0 top-10 z-50 w-56 rounded-2xl border border-ink-700/60 bg-ink-900/95 p-3.5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">
            Theme
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {(
              [
                ["dark", "Dark", <Moon key="m" size={13} strokeWidth={2} />],
                ["light", "Light", <Sun key="s" size={13} strokeWidth={2} />],
              ] as const
            ).map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setThemeAndApply(id)}
                aria-pressed={theme === id}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold",
                  "transition-all duration-[120ms] cursor-pointer",
                  theme === id
                    ? "border-accent bg-accent/15 text-ink-100 shadow-sm"
                    : "border-ink-800 text-ink-400 hover:border-ink-700 hover:text-ink-200"
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <p className="mt-3.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">
            Vibe
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {VIBES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVibeAndApply(v.id)}
                aria-pressed={vibe === v.id}
                aria-label={`${v.label} vibe`}
                title={v.label}
                className={cn(
                  "aspect-square rounded-full transition-transform duration-[120ms] hover:scale-110 cursor-pointer",
                  v.swatch,
                  vibe === v.id &&
                    "ring-2 ring-ink-100 ring-offset-2 ring-offset-ink-900 scale-105 shadow-sm"
                )}
              />
            ))}
          </div>
          <p className="mt-3 text-[0.7rem] leading-relaxed text-ink-500">
            Your room, your colours. The book stays the book.
          </p>
        </div>
      )}
    </div>
  );
}
