import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

/**
 * Prove the cross-instance path through Supabase Realtime actually works.
 *
 * Two INDEPENDENT clients — simulating two server instances that share
 * nothing but the Supabase project. Instance B subscribes to a circle
 * channel; instance A broadcasts a highlight event; B must receive it.
 *
 * This is exactly the flow lib/events.ts now runs on a multi-instance
 * deploy, so a pass here is the evidence that the documented
 * single-instance limitation (BLUEPRINT §4) is closed.
 *
 * Run: npx tsx scripts/verify-realtime.ts
 */

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("✗ Supabase env vars missing — check .env.local");
  process.exit(1);
}

const CHANNEL = `circle:verify-${Date.now()}`;
const EVENT = {
  type: "highlight:created",
  documentId: "doc-verify",
  highlightId: "hl-verify",
};

async function main() {
  const instanceA = createClient(url!, key!, { auth: { persistSession: false } });
  const instanceB = createClient(url!, key!, { auth: { persistSession: false } });

  const t0 = Date.now();

  const received = new Promise<unknown>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("timed out after 15s — no broadcast received")),
      15_000
    );
    instanceB
      .channel(CHANNEL)
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        clearTimeout(timer);
        resolve(payload);
      })
      .subscribe((status) => {
        console.log(`instance B channel: ${status}`);
        if (status === "SUBSCRIBED") {
          // B is listening; now A (a different client = different instance)
          // publishes the way lib/events.ts does.
          const chA = instanceA.channel(CHANNEL);
          chA.subscribe((s) => {
            if (s === "SUBSCRIBED") {
              console.log("instance A channel: SUBSCRIBED — broadcasting");
              void chA.send({ type: "broadcast", event: "sync", payload: EVENT });
            }
          });
        }
      });
  });

  const payload = await received;
  const ms = Date.now() - t0;

  console.log("");
  console.log("received on instance B:", JSON.stringify(payload));
  const ok = JSON.stringify(payload) === JSON.stringify(EVENT);
  console.log(
    ok
      ? `✓ cross-instance broadcast round-trip in ${ms}ms — multi-instance live sync works`
      : "✗ payload mismatch"
  );

  await instanceA.removeAllChannels();
  await instanceB.removeAllChannels();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error("✗", err.message ?? err);
  process.exit(1);
});
