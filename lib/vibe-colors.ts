/**
 * Vibe/theme colours for surfaces that can't read CSS variables — the WebGL
 * story scene, canvas work, anywhere outside the DOM cascade.
 *
 * MUST stay in sync with app/globals.css (D13). One table, not scattered
 * per-component switches.
 */

export type VibeId = "ember" | "tide" | "bloom" | "meadow";
export type ThemeId = "dark" | "light";

type VibeSet = { accent: string; gradA: string; gradB: string };

const DARK: Record<VibeId, VibeSet> = {
  ember: { accent: "#f0b429", gradA: "#f0b429", gradB: "#f4703e" },
  tide: { accent: "#22d3ee", gradA: "#22d3ee", gradB: "#818cf8" },
  bloom: { accent: "#f472b6", gradA: "#f472b6", gradB: "#c084fc" },
  meadow: { accent: "#4ade80", gradA: "#4ade80", gradB: "#a3e635" },
};

const LIGHT: Record<VibeId, VibeSet> = {
  ember: { accent: "#a16207", gradA: "#b45309", gradB: "#c2410c" },
  tide: { accent: "#0e7490", gradA: "#0891b2", gradB: "#6366f1" },
  bloom: { accent: "#be185d", gradA: "#db2777", gradB: "#9333ea" },
  meadow: { accent: "#15803d", gradA: "#16a34a", gradB: "#65a30d" },
};

export function getVibeColors(vibe: string, theme: string) {
  const v = (["ember", "tide", "bloom", "meadow"].includes(vibe) ? vibe : "ember") as VibeId;
  const set = theme === "light" ? LIGHT[v] : DARK[v];

  return {
    ...set,
    /** Scene ground colour — matches --color-ink-950 per theme. */
    bg: theme === "light" ? "#f7f3ec" : "#0c0a09",
    /** The cold, desaturated world of the feed (Act I). */
    cold: theme === "light" ? "#8fa3b8" : "#3d4a5c",
    coldScreen: theme === "light" ? "#b8c7d6" : "#5b7a9d",
    /** Paper — the book's material, same in both themes (D12/D18). */
    paper: "#f4ecdb",
    paperInk: "#1b160f",
    /** Character skin/cloth neutrals. */
    figure: theme === "light" ? "#c9bda9" : "#8a7f76",
    figureDim: theme === "light" ? "#a89c88" : "#574e47",
    /** Friends keep the app's seeded avatar colours — Maya, Dev. */
    friendA: "#ec4899",
    friendB: "#14b8a6",
  };
}
