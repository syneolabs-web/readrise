"use client";

import { useEffect, useRef } from "react";
import type { RealtimeEvent } from "@/lib/types";

/**
 * Subscribe to a circle's SSE stream.
 *
 * EventSource reconnects on its own with backoff, so there's no retry logic
 * here — that's the main reason SSE beats a hand-rolled WebSocket for this.
 */
export function useRealtime(
  circleId: string,
  onEvent: (event: RealtimeEvent) => void
) {
  // Keep the latest callback without making it a dependency, otherwise every
  // parent render would tear down and re-open the connection.
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    if (!circleId) return;

    const source = new EventSource(
      `/api/stream?circleId=${encodeURIComponent(circleId)}`
    );

    source.onmessage = (e) => {
      try {
        handler.current(JSON.parse(e.data) as RealtimeEvent);
      } catch {
        // Ignore malformed frames rather than killing the stream.
      }
    };

    // EventSource surfaces reconnects as errors; it recovers by itself, so
    // logging here would just be noise.
    source.onerror = () => {};

    return () => source.close();
  }, [circleId]);
}
