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

const VIBES = [
  { id: "ember", label: "Ember", a: "#f0b429", b: "#f4703e" },
  { id: "tide", label: "Tide", a: "#22d3ee", b: "#818cf8" },
  { id: "bloom", label: "Bloom", a: "#f472b6", b: "#c084fc" },
  { id: "meadow", label: "Meadow", a: "#4ade80", b: "#a3e635" },
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
        <div className="animate-fade-up absolute right-0 top-9 z-50 w-52 rounded-lg border border-ink-800 bg-ink-900 p-3 shadow-2xl shadow-black/40">
          <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            Theme
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {(
              [
                ["dark", "Dark", <Moon key="m" size={13} strokeWidth={1.75} />],
                ["light", "Light", <Sun key="s" size={13} strokeWidth={1.75} />],
              ] as const
            ).map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setThemeAndApply(id)}
                aria-pressed={theme === id}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium",
                  "transition-colors duration-[120ms]",
                  theme === id
                    ? "border-accent/50 bg-accent/10 text-ink-100"
                    : "border-ink-800 text-ink-400 hover:border-ink-700 hover:text-ink-200"
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            Vibe
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {VIBES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVibeAndApply(v.id)}
                aria-pressed={vibe === v.id}
                aria-label={`${v.label} vibe`}
                title={v.label}
                className={cn(
                  "aspect-square rounded-full transition-transform duration-[120ms] hover:scale-110",
                  vibe === v.id &&
                    "ring-2 ring-ink-100 ring-offset-2 ring-offset-ink-900 scale-110"
                )}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${v.a}, ${v.b})`,
                }}
              />
            ))}
          </div>
          <p className="mt-2.5 text-2xs leading-relaxed text-ink-600">
            Your room, your colours. The book stays the book.
          </p>
        </div>
      )}
    </div>
  );
}
