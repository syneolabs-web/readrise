import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { RealtimeEvent } from "./types";

/**
 * Pub/sub backing the SSE stream — now bridged through Supabase Realtime.
 *
 * Architecture unchanged from the client's point of view: browsers still hold
 * one SSE connection to /api/stream, and events still carry only signals
 * ("a highlight changed"), never payloads — every refetch re-passes the
 * authorization gate, so the stream can't leak data.
 *
 * What changed: publish() now ALSO broadcasts on a Supabase channel, and each
 * server instance subscribes to the channels of the circles it is serving.
 * That closes the documented single-instance limitation (BLUEPRINT §4): on a
 * multi-instance deploy, user A on instance 1 now sees user B's highlight from
 * instance 2, because the event crosses instances through Supabase.
 *
 *   publish ──► local fan-out (same instance, zero latency)
 *          └──► supabase broadcast ──► other instances ──► their local fan-out
 *
 * `self: false` on the channel prevents the publishing instance from receiving
 * its own broadcast — it already fanned out locally, and the echo would
 * double-deliver.
 *
 * Without Supabase env vars this degrades to the original in-process bus, so
 * local dev works offline.
 *
 * Security note: channels are named by circleId (an unguessable cuid), events
 * carry only ids, and reads are authorized at refetch — so the publishable
 * key is sufficient here. No RLS dependency.
 */

type Subscriber = (event: RealtimeEvent) => void;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Survives dev hot-reload; otherwise every save orphans live connections.
const g = globalThis as unknown as {
  __prodoxityBus: Map<string, Set<Subscriber>> | undefined;
  __prodoxitySb: SupabaseClient | undefined;
  __prodoxityChannels: Map<string, RealtimeChannel> | undefined;
};

const bus: Map<string, Set<Subscriber>> = g.__prodoxityBus ?? new Map();
g.__prodoxityBus = bus;

const channels: Map<string, RealtimeChannel> = g.__prodoxityChannels ?? new Map();
g.__prodoxityChannels = channels;

function supabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!g.__prodoxitySb) {
    g.__prodoxitySb = createClient(SUPABASE_URL, SUPABASE_KEY, {
      // This is a server-side infrastructure client, not a user session.
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return g.__prodoxitySb;
}

/** Deliver to every subscriber on THIS instance. */
function fanLocal(circleId: string, event: RealtimeEvent): void {
  const subs = bus.get(circleId);
  if (!subs) return;
  for (const send of subs) {
    // One dead connection must not block the rest of the circle.
    try {
      send(event);
    } catch {
      subs.delete(send);
    }
  }
}

/** Join (or reuse) this circle's cross-instance channel. */
function ensureChannel(circleId: string): RealtimeChannel | null {
  const sb = supabase();
  if (!sb) return null;

  let channel = channels.get(circleId);
  if (channel) return channel;

  channel = sb.channel(`circle:${circleId}`, {
    config: { broadcast: { self: false } },
  });
  channel.on("broadcast", { event: "sync" }, ({ payload }) => {
    // An event produced on another instance; deliver it to ours.
    fanLocal(circleId, payload as RealtimeEvent);
  });
  channel.subscribe((status, err) => {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      // Live cross-instance sync is degraded, not broken — local fan-out and
      // page reloads still work. Log once rather than spamming per event.
      console.warn(`[events] supabase channel ${circleId}: ${status}`, err ?? "");
    }
  });

  channels.set(circleId, channel);
  return channel;
}

/** Fan an event out to everyone currently reading in this circle. */
export function publish(circleId: string, event: RealtimeEvent): void {
  // Same-instance subscribers first: zero added latency, works offline.
  fanLocal(circleId, event);

  // Then across instances. supabase-js falls back to the HTTP broadcast
  // endpoint when the socket isn't joined yet, so this is safe to fire early.
  const channel = ensureChannel(circleId);
  if (channel) {
    void channel
      .send({ type: "broadcast", event: "sync", payload: event })
      .catch(() => {
        // Broadcast is best-effort by design; the durable truth is in the DB.
      });
  }
}

/** @returns an unsubscribe function; the SSE route calls it on abort. */
export function subscribe(circleId: string, fn: Subscriber): () => void {
  let subs = bus.get(circleId);
  if (!subs) {
    subs = new Set();
    bus.set(circleId, subs);
  }
  subs.add(fn);

  // Listening locally means we must also hear the other instances.
  ensureChannel(circleId);

  return () => {
    const s = bus.get(circleId);
    if (!s) return;
    s.delete(fn);
    if (s.size === 0) {
      bus.delete(circleId);
      // Nobody on this instance is reading this circle anymore; release the
      // upstream channel rather than accumulating sockets forever.
      const channel = channels.get(circleId);
      if (channel) {
        channels.delete(circleId);
        void supabase()?.removeChannel(channel);
      }
    }
  };
}

export function subscriberCount(circleId: string): number {
  return bus.get(circleId)?.size ?? 0;
}
