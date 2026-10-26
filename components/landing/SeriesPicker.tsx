"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/**
 * The modern vibe & theme picker: four radiant series hues + warm light/night toggle.
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
          ? "bg-black/15 border border-white/20"
          : "border border-cover-rule/40 bg-cover-paper-2/60"
      }`}
    >
      <div role="radiogroup" aria-label="Cover colour" className="flex items-center gap-1.5 px-1">
        {SERIES.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={vibe === s.id}
            aria-label={`${s.label} vibe`}
            title={`${s.label} vibe`}
            onClick={() => setVibe(s.id)}
            className={`relative h-4.5 w-4.5 rounded-full transition-all duration-200 hover:scale-115 active:scale-95 ${s.swatch} ${
              vibe === s.id
                ? "scale-110 ring-2 ring-cover-ink ring-offset-2 ring-offset-cover-paper shadow-sm"
                : "opacity-75 hover:opacity-100"
            }`}
          />
        ))}
      </div>
      <div className={`h-3.5 w-px ${band ? "bg-white/25" : "bg-cover-rule/40"} mx-0.5`} />
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={theme === "dark" ? "Switch to warm daylight" : "Switch to night focus"}
        title={theme === "dark" ? "Switch to daylight" : "Switch to night focus"}
        className={`grid h-7 w-7 place-items-center rounded-full transition-all duration-150 active:scale-95 ${
          band
            ? "text-series-ink hover:bg-black/10"
            : "text-cover-ink-soft hover:bg-cover-ink/10 hover:text-cover-ink"
        }`}
      >
        {theme === "dark" ? (
          <Sun size={15} strokeWidth={2} aria-hidden="true" className="text-amber-400" />
        ) : (
          <Moon size={15} strokeWidth={2} aria-hidden="true" className="text-indigo-600" />
        )}
      </button>
    </div>
  );
}
