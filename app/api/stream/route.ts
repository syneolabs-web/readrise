import { requireCircleMember, requireUserApi, AuthError } from "@/lib/auth";
import { subscribe } from "@/lib/events";
import type { RealtimeEvent } from "@/lib/types";

// Must not be edge/static: this holds a long-lived connection and reads the
// in-process event bus.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel caps function duration (60s on Hobby, more on Pro), and a serverless
 * platform will terminate a long-lived stream whether or not we ask it to.
 * Stating the bound makes the behaviour predictable instead of mysterious:
 * the connection ends cleanly at a known point and EventSource reconnects on
 * its own (see hooks/useRealtime.ts), so users see no interruption.
 *
 * Cost note: each reconnect is a fresh invocation, so an idle tab costs one
 * invocation per minute. If that ever matters, the move is to drop SSE and
 * subscribe the browser directly to Supabase Realtime — the event bus is
 * already bridged through it (lib/events.ts), so the server hop is the only
 * part that would go away.
 */
export const maxDuration = 60;

/** Proxies commonly kill idle connections around 60s. */
const HEARTBEAT_MS = 25_000;

/**
 * Live updates for one circle.
 *
 * SSE rather than WebSockets: traffic here is ~99% server→client, and the
 * client already has HTTP POST for the other direction. See BLUEPRINT §4.
 *
 * Events carry only a signal ("a highlight changed in this document"), never
 * a payload. Clients refetch through the normal authorized endpoints, so the
 * stream can never become a way to leak data past an authorization check.
 */
export async function GET(req: Request) {
  try {
    const user = await requireUserApi();
    const circleId = new URL(req.url).searchParams.get("circleId");
    if (!circleId) return new Response("circleId required", { status: 400 });

    await requireCircleMember(user.id, circleId);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let open = true;

        const send = (data: string) => {
          if (!open) return;
          try {
            controller.enqueue(encoder.encode(data));
          } catch {
            open = false; // client vanished mid-write
          }
        };

        const onEvent = (event: RealtimeEvent) => {
          send(`data: ${JSON.stringify(event)}\n\n`);
        };

        send(`: connected\n\n`);
        const unsubscribe = subscribe(circleId, onEvent);

        // A comment line is a valid no-op frame — keeps the pipe warm without
        // the client having to filter it out.
        const heartbeat = setInterval(() => send(`: ping\n\n`), HEARTBEAT_MS);

        const cleanup = () => {
          if (!open) return;
          open = false;
          clearInterval(heartbeat);
          unsubscribe();
          try {
            controller.close();
          } catch {
            // Already closed by the runtime.
          }
        };

        req.signal.addEventListener("abort", cleanup);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        // Nginx buffers by default, which defeats the whole point.
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(err.message, { status: err.status });
    }
    console.error("[stream]", err);
    return new Response("Something went wrong", { status: 500 });
  }
}
