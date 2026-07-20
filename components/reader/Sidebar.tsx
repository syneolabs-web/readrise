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
  open,
  onClose,
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
  /** Sheet visibility below lg. Ignored at lg+, where the column is always shown. */
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("threads");

  return (
    /**
     * Two layouts, one component.
     *
     * Desktop (lg+): a fixed 26rem column beside the page — unchanged.
     * Below lg: a bottom sheet. A 26rem column on a 375px screen left the page
     * itself about 60px wide, which is why the reader was unusable on a phone.
     * A sheet keeps the conversation reachable without ever competing with the
     * page for width, and 78vh leaves enough of the page visible behind it that
     * you keep your place.
     */
    <aside
      className={cn(
        "flex flex-col border-ink-800 bg-ink-950",
        "lg:w-[26rem] lg:shrink-0 lg:border-l",
        // Sheet below lg. Hidden entirely unless opened, so the page column
        // gets the full viewport by default — reading is the primary job.
        "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:h-[78vh]",
        "max-lg:rounded-t-2xl max-lg:border-t max-lg:shadow-2xl",
        "max-lg:transition-transform max-lg:duration-300 max-lg:motion-reduce:transition-none",
        open ? "max-lg:translate-y-0" : "max-lg:translate-y-full max-lg:pointer-events-none"
      )}
    >
      {/* Grab handle + close, sheet only. Gives the sheet an obvious dismiss
          target; without one the only way back to the page is the toolbar. */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-1 lg:hidden">
        <span className="mx-auto h-1 w-10 rounded-full bg-ink-700" aria-hidden />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-xs text-ink-400 hover:text-ink-100"
        >
          Close
        </button>
      </div>

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
