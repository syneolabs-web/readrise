"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IconCheck } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Check in on this week's habit, from wherever you are.
 *
 * Optimistic: the press flips state at once and the server catches up, so a
 * check-in feels like ticking a box rather than submitting a form. If the
 * request fails the box flips back and says so.
 */
export function CheckinButton({
  actionId,
  done: initial,
  className,
}: {
  actionId: string;
  done: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  async function toggle() {
    const next = !done;
    setDone(next);
    setFailed(false);
    const res = await fetch(`/api/actions/${actionId}/checkin`, { method: "POST" }).catch(() => null);
    if (!res?.ok) {
      setDone(!next);
      setFailed(true);
      return;
    }
    start(() => router.refresh());
  }

  return (
    <span className={cn("inline-flex flex-col items-end gap-1", className)}>
      <button
        onClick={toggle}
        aria-pressed={done}
        disabled={pending}
        className={cn(
          "cover-label inline-flex h-9 items-center gap-1.5 rounded-[3px] px-3 text-xs font-bold",
          "[transition:transform_var(--dur-press)_var(--ease-out),background-color_var(--dur-micro)_ease,color_var(--dur-micro)_ease,border-color_var(--dur-micro)_ease]",
          "active:scale-[0.96]",
          done
            ? "bg-series text-series-ink"
            : "border border-ink-700 text-ink-200 hover:border-ink-400 hover:text-ink-100"
        )}
      >
        <span
          className={cn(
            "grid h-4 w-4 place-items-center rounded-[2px] border",
            done ? "border-series-ink/60" : "border-ink-500"
          )}
          aria-hidden="true"
        >
          {done && <IconCheck size={11} />}
        </span>
        {done ? "Done this week" : "Mark done"}
      </button>
      {failed && (
        <span role="alert" className="text-2xs text-ink-400">
          Didn&apos;t save — try again.
        </span>
      )}
    </span>
  );
}
