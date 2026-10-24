"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, Button, Card } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { IconStarFilled } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { RankedMember } from "@/lib/circle-governance";

/**
 * Circle standings, as a stacked bar chart.
 *
 * The bar doesn't just show HOW MUCH someone scored — each segment is that
 * metric's *weighted contribution*, so the chart answers "why is this person
 * ranked here?" at a glance. Someone who reads a lot and someone who argues a
 * lot have visibly different bars even on an identical score, which is the
 * whole point of letting the admin set weights.
 *
 * Colour comes from the vibe gradient (grad-a -> grad-b) rather than three
 * arbitrary hues, so the chart re-skins with the theme and still reads as one
 * family (D13). Bars grow on mount; prefers-reduced-motion collapses that
 * globally via the transition-duration override in globals.css.
 */

/**
 * Three steps of the vibe accent, mixed toward the page ground.
 *
 * NOT grad-a -> grad-b: some vibes (ember is #b45309 -> #c2410c) have gradient
 * endpoints a few degrees apart, which makes categorical segments
 * indistinguishable and quietly destroys the chart's meaning. Stepping one hue
 * by mix ratio guarantees separable bands in every vibe and both themes, and
 * mixing toward `ink-950` means the step direction always moves away from the
 * foreground — lighter on paper, darker at night.
 */
const SEGMENTS = [
  {
    key: "pages" as const,
    label: "Pages read",
    color: "var(--color-accent)",
  },
  {
    key: "highlights" as const,
    label: "Highlights",
    color: "color-mix(in srgb, var(--color-accent) 66%, var(--color-ink-950))",
  },
  {
    key: "discussion" as const,
    label: "Discussion",
    color: "color-mix(in srgb, var(--color-accent) 38%, var(--color-ink-950))",
  },
];

export function Leaderboard({
  circleId,
  rows,
  isAdmin,
  config,
}: {
  circleId: string;
  rows: RankedMember[];
  isAdmin: boolean;
  config: {
    lbEnabled: boolean;
    lbWeightPages: number;
    lbWeightHighlights: number;
    lbWeightDiscussion: number;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(config);
  const [busy, setBusy] = useState(false);

  // Bars animate from zero width once mounted.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/circles/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circleId, ...form }),
    });
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  if (!config.lbEnabled && !isAdmin) return null;

  const weights = {
    pages: config.lbWeightPages,
    highlights: config.lbWeightHighlights,
    discussion: config.lbWeightDiscussion,
  };
  const top = Math.max(...rows.map((r) => r.score), 0);

  return (
    <>
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="plate-label">
            Standings
          </h2>
          <div className="flex items-center gap-3">
            {/* Legend: without it the three colours are decoration. */}
            <div className="hidden items-center gap-3 sm:flex">
              {SEGMENTS.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden="true"
                  />
                  <span className="text-2xs text-ink-500">
                    {s.label}
                    <span className="ml-1 fig text-ink-500">
                      ×{weights[s.key]}
                    </span>
                  </span>
                </span>
              ))}
            </div>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
                Configure
              </Button>
            )}
          </div>
        </div>

        {!config.lbEnabled ? (
          <Card className="mt-3 border-dashed p-4">
            <p className="text-xs text-ink-500">
              Standings are switched off. Only you can see this.
            </p>
          </Card>
        ) : top === 0 ? (
          // Every score is zero, so the bars would all render as invisible
          // slivers with no explanation. Say what fills them instead — an
          // empty state that teaches beats one that apologises.
          <Card className="mt-3 border-dashed p-6 text-center">
            <p className="text-sm font-medium text-ink-300">
              No reading logged yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
              Standings fill in as the circle reads, highlights and replies —
              open a book and you&apos;ll be the first one here.
            </p>
          </Card>
        ) : (
          <Card className="mt-3 divide-y divide-ink-850 overflow-hidden">
            {rows.map((r, i) => {
              const contrib = {
                pages: r.pages * weights.pages,
                highlights: r.highlights * weights.highlights,
                discussion: r.discussion * weights.discussion,
              };
              const barPct = top > 0 ? (r.score / top) * 100 : 0;
              const lead = r.rank === 1 && r.score > 0;

              return (
                <div
                  key={r.userId}
                  className={cn(
                    "relative px-4 py-3 transition-colors duration-[240ms]",
                    lead && "bg-accent/[0.05]"
                  )}
                >
                  {/* Leader gets an accent rail rather than a gold medal —
                      medals would fight the vibe palette. */}
                  {lead && (
                    <span
                      className="absolute inset-y-0 left-0 w-[3px] bg-accent"
                      aria-hidden="true"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "fig w-5 shrink-0 text-center text-sm font-semibold",
                        lead ? "text-accent" : "text-ink-600"
                      )}
                    >
                      {r.rank}
                    </span>
                    <Avatar
                      name={r.name}
                      color={r.avatarColor}
                      size={26}
                      className={lead ? "ring-2 ring-accent/40" : ""}
                    />
                    <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm text-ink-100">
                      {r.name}
                      {r.isAdmin && (
                        <span className="rounded border border-accent/25 bg-accent/10 px-1 py-px text-2xs font-semibold uppercase tracking-wider text-accent">
                          Admin
                        </span>
                      )}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 text-base font-semibold tabular-nums",
                        lead ? "text-grad" : "text-ink-200"
                      )}
                    >
                      {r.score}
                    </span>
                  </div>

                  {/* The chart. Outer width is score relative to the leader;
                      inner segments are each metric's weighted contribution. */}
                  <div className="mt-2 flex items-center gap-3 pl-8">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-850">
                      <div
                        className="flex h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out"
                        style={{
                          width: grown ? `${barPct}%` : "0%",
                          transitionDelay: `${i * 90}ms`,
                        }}
                      >
                        {SEGMENTS.map((s) => {
                          const part =
                            r.score > 0 ? (contrib[s.key] / r.score) * 100 : 0;
                          if (part <= 0) return null;
                          return (
                            <span
                              key={s.key}
                              className="h-full"
                              style={{
                                width: `${part}%`,
                                background: s.color,
                                // Hairline in the track colour: keeps the
                                // boundary legible even when two steps land
                                // close together on a very short segment.
                                boxShadow:
                                  "inset -1px 0 0 var(--color-ink-850)",
                              }}
                              title={`${s.label}: ${contrib[s.key]} of ${r.score}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <p className="mt-1.5 pl-8 fig text-2xs text-ink-600">
                    {r.pages} pages · {r.highlights} highlights · {r.discussion}{" "}
                    replies
                  </p>
                </div>
              );
            })}
          </Card>
        )}
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Configure standings"
        description="Set what this circle rewards. Weights multiply each count into the score."
      >
        <form onSubmit={save} className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-ink-200">
            <input
              type="checkbox"
              checked={form.lbEnabled}
              onChange={(e) => setForm((f) => ({ ...f, lbEnabled: e.target.checked }))}
              className="accent-[var(--color-accent)]"
            />
            Show standings to the circle
          </label>

          {(
            [
              ["lbWeightPages", "Pages read", SEGMENTS[0]!.color],
              ["lbWeightHighlights", "Highlights", SEGMENTS[1]!.color],
              ["lbWeightDiscussion", "Discussion", SEGMENTS[2]!.color],
            ] as const
          ).map(([key, label, color]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  {label}
                </span>
                <span className="fig text-ink-500">×{form[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
                }
                className="mt-1 w-full accent-[var(--color-accent)]"
              />
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/** The broadcast praise strip — the admin pointing at somebody's thinking. */
export function ShoutoutStrip({
  shoutouts,
}: {
  shoutouts: {
    id: string;
    note: string | null;
    toName: string;
    toColor: string;
    fromName: string;
    text: string | null;
  }[];
}) {
  if (shoutouts.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="plate-label">
        Shoutouts
      </h2>
      <div className="mt-3 space-y-2">
        {shoutouts.map((s) => (
          <Card key={s.id} className="border-accent/25 bg-accent/[0.04] p-4">
            <div className="flex items-center gap-2">
              <span className="text-accent">
                <IconStarFilled size={13} />
              </span>
              <Avatar name={s.toName} color={s.toColor} size={18} />
              <p className="text-xs text-ink-200">
                <span className="font-medium">{s.toName}</span>
                <span className="text-ink-500"> — shouted out by {s.fromName}</span>
              </p>
            </div>
            {s.text && (
              <blockquote className="mt-2 border-l-2 border-accent/40 pl-3 font-prose text-sm leading-relaxed text-ink-200">
                {s.text}
              </blockquote>
            )}
            {s.note && (
              <p className="mt-2 text-xs leading-relaxed text-ink-400">{s.note}</p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
