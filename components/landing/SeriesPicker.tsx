"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/**
 * The vibe picker, in the cover's own vocabulary: the four vibes are the four
 * series colours, so choosing one reprints the cover you're holding. Same
 * state as the in-app ThemeMenu (pdx-* keys), so the choice follows the
 * visitor into the product.
 */
const SERIES = [
  { id: "ember", label: "Orange", swatch: "bg-series-orange" },
  { id: "tide", label: "Blue", swatch: "bg-series-blue" },
  { id: "bloom", label: "Cerise", swatch: "bg-series-cerise" },
  { id: "meadow", label: "Green", swatch: "bg-series-green" },
] as const;

export function SeriesPicker() {
  const { theme, vibe, setTheme, setVibe } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Cover colour" className="flex items-center gap-1.5">
        {SERIES.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={vibe === s.id}
            aria-label={`${s.label} cover`}
            title={`${s.label} cover`}
            onClick={() => setVibe(s.id)}
            className={`h-5 w-5 rounded-full border-2 border-series-ink/70 ${s.swatch} transition-transform duration-[140ms] [@media(hover:hover)]:hover:scale-110 ${
              vibe === s.id ? "ring-2 ring-series-ink ring-offset-2 ring-offset-series" : ""
            }`}
          />
        ))}
      </div>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={theme === "dark" ? "Switch to light pages" : "Switch to dark pages"}
        className="grid h-8 w-8 place-items-center rounded-full text-series-ink transition-colors duration-[120ms] hover:bg-series-ink/10"
      >
        {theme === "dark" ? (
          <Sun size={17} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Moon size={17} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
