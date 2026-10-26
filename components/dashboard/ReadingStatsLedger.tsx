"use client";

import { useState } from "react";
import { IconFlame, IconStarFilled, IconHighlighter, IconBookOpen, IconTrendingUp } from "@/components/icons";

type DayStat = {
  label: string;
  count: number;
};

type Props = {
  progress: {
    streak: number;
    insights: number;
    highlights: number;
    books: number;
    week: DayStat[];
  };
};

export function ReadingStatsLedger({ progress }: Props) {
  const [hoveredDay, setHoveredDay] = useState<DayStat | null>(null);

  const peak = Math.max(...progress.week.map((d) => d.count), 1);
  const totalWeekHighlights = progress.week.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-800/70 pb-2.5">
        <div className="flex items-center gap-2">
          <IconTrendingUp size={15} className="text-accent" />
          <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-400">
            Reader&apos;s Ledger
          </h3>
        </div>
        <span className="text-3xs text-ink-500 font-semibold">
          Analytics
        </span>
      </div>

      {/* 4-Item Bento Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Card 1: Streak */}
        <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-ink-400">Streak</span>
            <IconFlame size={12} className="text-accent" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-ink-100">{progress.streak}</span>
            <span className="text-3xs font-semibold text-ink-500">wks</span>
          </div>
          <p className="mt-0.5 text-3xs text-ink-400 truncate">
            {progress.streak > 0 ? "Active habit" : "Starts this week"}
          </p>
        </div>

        {/* Card 2: Vault */}
        <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-ink-400">Vault</span>
            <IconStarFilled size={12} className="text-accent" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-ink-100">{progress.insights}</span>
            <span className="text-3xs font-semibold text-ink-500">gems</span>
          </div>
          <p className="mt-0.5 text-3xs text-ink-400 truncate">
            Saved takeaways
          </p>
        </div>

        {/* Card 3: Highlights */}
        <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-ink-400">Notes</span>
            <IconHighlighter size={12} className="text-accent" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-ink-100">{progress.highlights}</span>
            <span className="text-3xs font-semibold text-ink-500">total</span>
          </div>
          <p className="mt-0.5 text-3xs text-ink-400 truncate">
            Marked passages
          </p>
        </div>

        {/* Card 4: Books */}
        <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-ink-400">Shelf</span>
            <IconBookOpen size={12} className="text-accent" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-ink-100">{progress.books}</span>
            <span className="text-3xs font-semibold text-ink-500">{progress.books === 1 ? "vol" : "vols"}</span>
          </div>
          <p className="mt-0.5 text-3xs text-ink-400 truncate">
            Read together
          </p>
        </div>
      </div>

      {/* 7-Day Activity Velocity Chart */}
      <div className="mt-3 rounded-2xl border border-ink-800/70 bg-ink-950/40 p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xs font-bold uppercase tracking-wider text-ink-400">
              7-Day Activity
            </span>
            <p className="text-3xs text-ink-500 mt-0.5">
              {totalWeekHighlights > 0
                ? `${totalWeekHighlights} ${totalWeekHighlights === 1 ? "note" : "notes"} this week`
                : "No notes this week"}
            </p>
          </div>
          {hoveredDay && (
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-3xs font-bold text-accent">
              {hoveredDay.label}: {hoveredDay.count}
            </span>
          )}
        </div>

        {/* Minimalist Bar Graph */}
        <div className="mt-2.5 flex h-14 items-end gap-1 pt-1">
          {progress.week.map((d, i) => {
            const heightPct = Math.max(12, Math.round((d.count / peak) * 100));
            const hasData = d.count > 0;

            return (
              <div
                key={i}
                className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    hasData
                      ? "bg-accent shadow-xs group-hover:brightness-110"
                      : "bg-ink-800/60 group-hover:bg-ink-700"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="mt-1 text-3xs font-medium text-ink-500 group-hover:text-ink-200">
                  {d.label[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
