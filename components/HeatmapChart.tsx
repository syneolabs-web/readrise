"use client";

import { useMemo, useState } from "react";
import { IconActivity, IconSparkles } from "@/components/icons";

type HeatmapProps = {
  days: { date: string; count: number; level: number }[];
};

export function HeatmapChart({ days }: HeatmapProps) {
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);

  const stats = useMemo(() => {
    const activeDays = days.filter((d) => d.count > 0).length;
    const totalCount = days.reduce((acc, curr) => acc + curr.count, 0);
    return { activeDays, totalCount };
  }, [days]);

  const paddedDays = useMemo(() => {
    if (!days.length) return [];

    const [y, m, d] = days[0].date.split("-").map(Number);
    const startDayOfWeek = new Date(y, m - 1, d).getDay();

    const pad = Array.from({ length: startDayOfWeek }).map((_, i) => ({
      date: `pad-${i}`,
      count: 0,
      level: -1,
    }));

    return [...pad, ...days];
  }, [days]);

  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      cols.push(paddedDays.slice(i, i + 7));
    }
    return cols;
  }, [paddedDays]);

  const levelColors: Record<number, string> = {
    [-1]: "bg-transparent",
    0: "bg-ink-850/80 hover:bg-ink-800",
    1: "bg-accent/35 hover:bg-accent/45",
    2: "bg-accent/60 hover:bg-accent/70",
    3: "bg-accent/85 hover:bg-accent/95",
    4: "bg-accent hover:brightness-110",
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <IconActivity size={16} />
          </div>
          <div>
            <h3 className="cover-label text-sm sm:text-base font-bold text-ink-100">
              90-Day Reading Pulse
            </h3>
            <p className="text-3xs sm:text-xs text-ink-400">
              Consistent chapter checkins, margin debates, and vault saves
            </p>
          </div>
        </div>

        {/* Quick Tally Badges */}
        <div className="flex items-center gap-2 text-3xs font-semibold">
          <span className="rounded-full bg-ink-850 px-2.5 py-1 text-ink-300 border border-ink-800">
            {stats.activeDays} {stats.activeDays === 1 ? "day" : "days"} active
          </span>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent border border-accent/20">
            {stats.totalCount} {stats.totalCount === 1 ? "contribution" : "contributions"}
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="mt-5 w-full overflow-x-auto pb-2">
        <div className="min-w-fit mx-auto">
          <div className="flex gap-2">
            {/* Day Labels */}
            <div className="flex flex-col gap-[7px] text-3xs font-medium text-ink-500 mt-[26px]">
              <div className="h-3 flex items-center justify-end pr-1 text-4xs"></div>
              <div className="h-3 flex items-center justify-end pr-1 text-4xs">Mon</div>
              <div className="h-3 flex items-center justify-end pr-1 text-4xs"></div>
              <div className="h-3 flex items-center justify-end pr-1 text-4xs">Wed</div>
              <div className="h-3 flex items-center justify-end pr-1 text-4xs"></div>
              <div className="h-3 flex items-center justify-end pr-1 text-4xs">Fri</div>
              <div className="h-3 flex items-center justify-end pr-1 text-4xs"></div>
            </div>

            <div className="flex-1">
              {/* Month Labels */}
              <div className="flex justify-between text-3xs font-semibold text-ink-500 mb-2.5 px-1">
                <span>90 days ago</span>
                {hovered ? (
                  <span className="text-accent font-bold animate-fade-in">
                    {hovered.count} {hovered.count === 1 ? "activity" : "activities"} on {hovered.date}
                  </span>
                ) : (
                  <span>Today</span>
                )}
              </div>

              {/* The Grid */}
              <div className="flex gap-[7px]">
                {columns.map((col, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-[7px]">
                    {col.map((day) => (
                      <div
                        key={day.date}
                        onMouseEnter={() => {
                          if (day.level >= 0) setHovered({ date: day.date, count: day.count });
                        }}
                        onMouseLeave={() => setHovered(null)}
                        className={`w-3.5 h-3.5 rounded-[3px] ${levelColors[day.level]} transition-all duration-150 cursor-pointer ${
                          day.level >= 0 ? "hover:scale-125 hover:z-10 hover:ring-1 hover:ring-ink-200" : ""
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-ink-800/60 text-3xs text-ink-400">
            <span className="flex items-center gap-1.5 text-ink-500">
              <IconSparkles size={11} className="text-accent" />
              <span>Read and annotate daily to maintain high rhythm</span>
            </span>

            <div className="flex items-center gap-2 font-medium">
              <span>Less</span>
              <div className="flex gap-1.5">
                <div className={`w-3 h-3 rounded-[2px] ${levelColors[0]}`} />
                <div className={`w-3 h-3 rounded-[2px] ${levelColors[1]}`} />
                <div className={`w-3 h-3 rounded-[2px] ${levelColors[2]}`} />
                <div className={`w-3 h-3 rounded-[2px] ${levelColors[3]}`} />
                <div className={`w-3 h-3 rounded-[2px] ${levelColors[4]}`} />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
