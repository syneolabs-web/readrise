"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HighlightDTO } from "@/lib/serialize";
import { ThreadPanel } from "./ThreadPanel";
import { ChatPanel } from "./ChatPanel";
import type { MilestoneInfo } from "./types";

type Tab = "threads" | "lounge";

export function Sidebar({
  documentId,
  circleId,
  highlights,
  activeHighlight,
  onSelect,
  onJump,
  onRefetch,
  viewer,
  milestones,
  myProgress,
  canShoutout,
}: {
  documentId: string;
  circleId: string;
  highlights: HighlightDTO[];
  activeHighlight: HighlightDTO | null;
  onSelect: (id: string | null) => void;
  onJump: (page: number) => void;
  onRefetch: () => void;
  viewer: { id: string; name: string; avatarColor: string };
  milestones: MilestoneInfo[];
  myProgress: number;
  canShoutout: boolean;
}) {
  const [tab, setTab] = useState<Tab>("threads");

  return (
    <aside className="flex w-[26rem] shrink-0 flex-col border-l border-ink-800 bg-ink-950">
      <div className="flex shrink-0 border-b border-ink-800">
        {(
          [
            ["threads", `Threads${highlights.length ? ` (${highlights.length})` : ""}`],
            ["lounge", "Lounge"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 border-b-2 px-4 py-3 text-xs font-medium transition-colors",
              tab === key
                ? "border-accent text-ink-100"
                : "border-transparent text-ink-500 hover:text-ink-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "threads" ? (
        <ThreadPanel
          circleId={circleId}
          highlights={highlights}
          activeHighlight={activeHighlight}
          onSelect={onSelect}
          onJump={onJump}
          onRefetch={onRefetch}
          viewer={viewer}
          canShoutout={canShoutout}
        />
      ) : (
        <ChatPanel
          circleId={circleId}
          documentId={documentId}
          milestones={milestones}
          myProgress={myProgress}
          viewer={viewer}
        />
      )}
    </aside>
  );
}
