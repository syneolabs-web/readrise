/**
 * Union types that would be Postgres enums if the schema weren't
 * parity-safe. See the PARITY RULE in prisma/schema.prisma.
 */

export type MemberRole = "owner" | "member";

export const HIGHLIGHT_COLORS = [
  "yellow",
  "green",
  "blue",
  "pink",
  "purple",
] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

/** Paint values for each highlight color: fill for the page, dot for the UI. */
export const COLOR_STYLES: Record<
  HighlightColor,
  { fill: string; solid: string; ring: string }
> = {
  yellow: { fill: "rgba(250, 204, 21, 0.38)", solid: "#facc15", ring: "#eab308" },
  green: { fill: "rgba(74, 222, 128, 0.38)", solid: "#4ade80", ring: "#22c55e" },
  blue: { fill: "rgba(96, 165, 250, 0.38)", solid: "#60a5fa", ring: "#3b82f6" },
  pink: { fill: "rgba(244, 114, 182, 0.38)", solid: "#f472b6", ring: "#ec4899" },
  purple: { fill: "rgba(192, 132, 252, 0.38)", solid: "#c084fc", ring: "#a855f7" },
};

export function isHighlightColor(v: string): v is HighlightColor {
  return (HIGHLIGHT_COLORS as readonly string[]).includes(v);
}

/**
 * A rect stored as fractions (0..1) of the PDF page's intrinsic size at
 * scale 1.0 — NOT viewport pixels. This is what makes highlights survive
 * zoom, resize, and DPI differences. See docs/BLUEPRINT.md §3.
 */
export type NormalizedRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Events pushed over SSE. Discriminated on `type`. */
export type RealtimeEvent =
  | { type: "highlight:created"; documentId: string; highlightId: string }
  | { type: "highlight:deleted"; documentId: string; highlightId: string }
  | { type: "comment:created"; highlightId: string; documentId: string }
  | { type: "comment:deleted"; highlightId: string; documentId: string }
  | { type: "chat:created"; circleId: string; milestoneId: string | null }
  | { type: "progress:updated"; documentId: string; userId: string; page: number }
  | { type: "action:updated"; circleId: string }
  | { type: "vault:updated"; circleId: string }
  /** Governance moved: a publish vote, a removal, a shoutout, config change. */
  | { type: "circle:updated"; circleId: string };
