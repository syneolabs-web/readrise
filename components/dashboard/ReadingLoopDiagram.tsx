"use client";

import { useState } from "react";
import {
  IconBookOpen,
  IconHighlighter,
  IconMessage,
  IconCheckCircle,
  IconStarFilled,
  IconArrow,
  IconSparkles,
} from "@/components/icons";

type Props = {
  stats: {
    books: number;
    highlights: number;
    activity: number;
    habitsDone: boolean;
    insights: number;
  };
};

export function ReadingLoopDiagram({ stats }: Props) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: "read",
      label: "Read",
      title: "Paced Reading",
      icon: IconBookOpen,
      stat: `${stats.books} ${stats.books === 1 ? "vol" : "vols"}`,
      description: "Read the same volume in sync. Member progress updates live on the margin rail.",
      badge: "Stage 01",
    },
    {
      id: "highlight",
      label: "Highlight",
      title: "Margin Highlights",
      icon: IconHighlighter,
      stat: `${stats.highlights} ${stats.highlights === 1 ? "note" : "notes"}`,
      description: "Mark resonant passages directly on the original words without breaking flow.",
      badge: "Stage 02",
    },
    {
      id: "discuss",
      label: "Discuss",
      title: "Margin Debates",
      icon: IconMessage,
      stat: `${stats.activity} ${stats.activity === 1 ? "event" : "events"}`,
      description: "Threaded conversations pinned right to the text, keeping deep debates in context.",
      badge: "Stage 03",
    },
    {
      id: "commit",
      label: "Habit",
      title: "Weekly Practice",
      icon: IconCheckCircle,
      stat: stats.habitsDone ? "Completed" : "Pending",
      description: "Turn the chapter's best idea into a concrete micro-habit your circle tracks every week.",
      badge: "Stage 04",
    },
    {
      id: "vault",
      label: "Vault",
      title: "Knowledge Vault",
      icon: IconStarFilled,
      stat: `${stats.insights} ${stats.insights === 1 ? "gem" : "gems"}`,
      description: "Preserve the circle's most timeless takeaways in a permanent, searchable archive.",
      badge: "Stage 05",
    },
  ];

  const current = activeStep !== null ? steps[activeStep] : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-800/70 pb-2.5">
        <div className="flex items-center gap-2">
          <IconSparkles size={14} className="text-accent" />
          <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-400">
            The Circle Reading Loop
          </h3>
        </div>

        <span className="text-3xs text-ink-500 font-medium">
          {activeStep !== null ? `Viewing Stage 0${activeStep + 1} of 05` : "Tap any stage to explore"}
        </span>
      </div>

      {/* 5-Stage Stepper: Compact, elegant, never truncated */}
      <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isSelected = activeStep === idx;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStep(isSelected ? null : idx)}
              className={`group flex flex-col items-center justify-center rounded-2xl p-2 sm:p-2.5 text-center transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-accent/15 border border-accent/50 text-accent shadow-xs"
                  : "border border-ink-800 bg-ink-850/60 text-ink-400 hover:border-ink-600 hover:text-ink-200"
              }`}
            >
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105 ${
                  isSelected ? "bg-accent text-on-accent" : "bg-ink-900 text-ink-400"
                }`}
              >
                <Icon size={14} />
              </div>

              <span className="cover-label mt-1 text-2xs sm:text-xs font-bold leading-none">
                {s.label}
              </span>

              <span className="mt-0.5 text-3xs font-medium text-ink-500 truncate max-w-full">
                {s.stat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Collapsible Explainer */}
      {current && (
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-ink-800 bg-ink-950/60 p-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-3xs font-bold uppercase tracking-wider text-accent">
                {current.badge}
              </span>
              <span className="text-ink-600">·</span>
              <span className="text-xs font-bold text-ink-100">{current.title}</span>
              <span className="text-ink-600">·</span>
              <span className="text-2xs text-ink-400 font-semibold">{current.stat}</span>
            </div>
            <p className="mt-0.5 text-xs text-ink-400 leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setActiveStep((prev) => ((prev ?? 0) + 1) % steps.length)}
              className="inline-flex items-center gap-1 rounded-full border border-ink-800 bg-ink-850 px-3 py-1 text-2xs font-semibold text-ink-300 hover:border-ink-600 hover:text-ink-100 transition-colors"
            >
              <span>Next</span>
              <IconArrow size={11} />
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(null)}
              className="text-2xs font-semibold text-ink-500 hover:text-ink-200 px-1.5 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
