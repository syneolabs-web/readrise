"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Modal } from "@/components/Modal";

export function CircleActions({ variant = "default" }: { variant?: "default" | "banner" }) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | "join" | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(null);
    setValue("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        open === "create" ? "/api/circles" : "/api/circles/join",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(open === "create" ? { name: value } : { code: value }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // push() alone serves the dashboard from the client Router Cache, so a
      // freshly joined circle wouldn't appear in the list behind you.
      router.push(`/circles/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <>
      {variant === "banner" ? (
        <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-ink-900/50 p-8 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)] before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.1),transparent_50%)]">
          <h2 className="font-display text-3xl font-light text-ink-100">
            <span className="rounded bg-accent/20 px-2 py-0.5 text-accent shadow-[0_0_15px_rgba(245,158,11,0.3)]">Start</span> Your First Reading Circle
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-400">
            Invite 2-5 friends for deep reading and shared accountability.
          </p>
          <div className="mt-6 flex items-center gap-6">
            <button
              onClick={() => setOpen("create")}
              className="group flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-ink-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 hover:bg-accent/90"
            >
              <span className="text-lg leading-none">+</span> Create Circle
            </button>
            <button
              onClick={() => setOpen("join")}
              className="text-sm font-medium text-ink-400 underline decoration-ink-600 underline-offset-4 transition-colors hover:text-ink-200"
            >
              Join with Code
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen("join")}>
            Join with code
          </Button>
          <Button size="sm" onClick={() => setOpen("create")}>
            New circle
          </Button>
        </div>
      )}

      <Modal
        open={open !== null}
        onClose={close}
        title={open === "create" ? "New circle" : "Join a circle"}
        description={
          open === "create"
            ? "Keep it small. Two or three people who will actually notice."
            : "Ask a member for the circle's invite code."
        }
      >
        <form onSubmit={submit} className="space-y-3">
          <Input
            autoFocus
            placeholder={open === "create" ? "Growth Mindset" : "GROWTH24"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={open === "join" ? "font-mono tracking-[0.2em] uppercase" : ""}
            required
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "…" : open === "create" ? "Create" : "Join"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
