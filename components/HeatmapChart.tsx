'use client';

import { useMemo } from 'react';

type HeatmapProps = {
  days: { date: string; count: number; level: number }[];
};

export function HeatmapChart({ days }: HeatmapProps) {
  const paddedDays = useMemo(() => {
    if (!days.length) return [];
    
    const [y, m, d] = days[0].date.split('-').map(Number);
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

  // One data ink — the viewer's own accent — at four strengths. It was
  // hard-coded amber, which ignored the vibe the reader chose.
  const levelColors: Record<number, string> = {
    [-1]: 'bg-transparent',
    0: 'bg-ink-850',
    1: 'bg-accent/30',
    2: 'bg-accent/55',
    3: 'bg-accent/80',
    4: 'bg-accent',
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-fit">
        <div className="flex gap-2">
          {/* Day Labels */}
          <div className="flex flex-col gap-[7px] text-2xs font-medium text-ink-500 mt-[26px]">
            <div className="h-3 flex items-center justify-end pr-1"></div>
            <div className="h-3 flex items-center justify-end pr-1">Mon</div>
            <div className="h-3 flex items-center justify-end pr-1"></div>
            <div className="h-3 flex items-center justify-end pr-1">Wed</div>
            <div className="h-3 flex items-center justify-end pr-1"></div>
            <div className="h-3 flex items-center justify-end pr-1">Fri</div>
            <div className="h-3 flex items-center justify-end pr-1"></div>
          </div>
          
          <div className="flex-1">
            {/* Month Labels */}
            <div className="flex justify-between text-2xs font-medium text-ink-500 mb-3 px-1">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
            
            {/* The Grid (explicit columns instead of gridAutoFlow) */}
            <div className="flex gap-[7px]">
              {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-[7px]">
                  {col.map((day) => (
                    <div
                      key={day.date}
                      title={day.level >= 0 ? `${day.count} activities on ${day.date}` : undefined}
                      className={`w-3 h-3 rounded-[2px] ${levelColors[day.level]} transition-colors hover:ring-2 hover:ring-ink-500`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-5 text-2xs font-medium text-ink-500">
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
  );
}
