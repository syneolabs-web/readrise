"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/**
 * The modern vibe & theme picker: four radiant series hues + warm light/night toggle.
 * Selected color uses an elegant concentric jewel finish with a centered white pip
 * and subtle luminous halo instead of a harsh black border.
 */
const SERIES = [
  { id: "ember", label: "Sunset Orange", swatch: "bg-series-orange" },
  { id: "tide", label: "Sapphire Blue", swatch: "bg-series-blue" },
  { id: "bloom", label: "Wild Rose", swatch: "bg-series-cerise" },
  { id: "meadow", label: "Emerald Sage", swatch: "bg-series-green" },
] as const;

export function SeriesPicker({ tone = "paper" }: { tone?: "paper" | "band" }) {
  const { theme, vibe, setTheme, setVibe } = useTheme();
  const band = tone === "band";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full p-1 backdrop-blur-md transition-all ${
        band
          ? "bg-black/20 border border-white/20 shadow-xs"
          : "border border-cover-rule/50 bg-cover-paper-2/70 shadow-2xs"
      }`}
    >
      <div role="radiogroup" aria-label="Cover series colour" className="flex items-center gap-1.5 px-0.5">
        {SERIES.map((s) => {
          const active = vibe === s.id;
          return (
            <button
              key={s.id}
              role="radio"
              aria-checked={active}
              aria-label={`${s.label} palette`}
              title={`${s.label} palette`}
              onClick={() => setVibe(s.id)}
              className={`group relative flex h-4.5 w-4.5 items-center justify-center rounded-full transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer ${s.swatch} ${
                active
                  ? "scale-110 shadow-sm ring-2 ring-white/90 ring-offset-1 ring-offset-cover-paper/90 dark:ring-white/80 dark:ring-offset-ink-900"
                  : "opacity-65 hover:opacity-100 hover:scale-105"
              }`}
            >
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
      <div className={`h-3.5 w-px ${band ? "bg-white/25" : "bg-cover-rule/50"} mx-0.5`} />
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={theme === "dark" ? "Switch to warm daylight" : "Switch to night focus"}
        title={theme === "dark" ? "Switch to daylight" : "Switch to night focus"}
        className={`grid h-6 w-6 place-items-center rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
          band
            ? "text-series-ink hover:bg-black/10"
            : "text-cover-ink-soft hover:bg-cover-ink/10 hover:text-cover-ink"
        }`}
      >
        {theme === "dark" ? (
          <Sun size={14} strokeWidth={2} aria-hidden="true" className="text-amber-400" />
        ) : (
          <Moon size={14} strokeWidth={2} aria-hidden="true" className="text-indigo-600" />
        )}
      </button>
    </div>
  );
}
