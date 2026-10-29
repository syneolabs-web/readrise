"use client";

import { useEffect, useRef } from "react";
import type { RealtimeEvent } from "@/lib/types";

type Listener = (event: RealtimeEvent) => void;

type StreamManager = {
  source: EventSource;
  listeners: Set<Listener>;
  cleanupTimer?: ReturnType<typeof setTimeout>;
};

// Global in-browser singleton map across all components in the active tab
const activeStreams = new Map<string, StreamManager>();

function subscribeToCircleStream(circleId: string, listener: Listener): () => void {
  let manager = activeStreams.get(circleId);

  // If a pending close timer exists for this circle, cancel it (component remounted)
  if (manager?.cleanupTimer) {
    clearTimeout(manager.cleanupTimer);
    manager.cleanupTimer = undefined;
  }

  if (!manager) {
    const source = new EventSource(
      `/api/stream?circleId=${encodeURIComponent(circleId)}`
    );
    const listeners = new Set<Listener>();

    source.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as RealtimeEvent;
        listeners.forEach((fn) => {
          try {
            fn(parsed);
          } catch {
            // Keep going if one subscriber throws
          }
        });
      } catch {
        // Ignore malformed frames
      }
    };

    // EventSource auto-reconnects on error
    source.onerror = () => {};

    manager = { source, listeners };
    activeStreams.set(circleId, manager);
  }

  manager.listeners.add(listener);

  return () => {
    const current = activeStreams.get(circleId);
    if (!current) return;
    current.listeners.delete(listener);

    // If no more components are listening, close after a debounce period
    // to avoid connection churn across page transitions
    if (current.listeners.size === 0) {
      current.cleanupTimer = setTimeout(() => {
        if (current.listeners.size === 0) {
          current.source.close();
          activeStreams.delete(circleId);
        }
      }, 1200);
    }
  };
}

/**
 * Subscribe to a circle's SSE stream.
 *
 * Multiplexed: multiple components listening to the same circle share a single
 * EventSource, preventing browser connection exhaustion and request blocking.
 */
export function useRealtime(
  circleId: string,
  onEvent: (event: RealtimeEvent) => void
) {
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    if (!circleId) return;
    return subscribeToCircleStream(circleId, (event) => handler.current(event));
  }, [circleId]);
}
