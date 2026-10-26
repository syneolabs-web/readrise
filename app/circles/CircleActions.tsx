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
        // First run: the two ways in, at full size. Printed flat like the
        // landing's actions — the old neon glow and gradient wash were the
        // one place the app still looked like a different product.
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setOpen("create")}
            className="cover-label inline-flex items-center gap-2 rounded-full bg-series px-7 py-3.5 text-base font-bold text-series-ink shadow-[0_4px_16px_-2px_var(--series)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Start a circle
          </button>
          <button
            onClick={() => setOpen("join")}
            className="cover-label rounded-full border border-ink-700/80 px-6 py-3.5 text-base font-semibold text-ink-200 transition-all duration-150 hover:border-ink-400 hover:bg-ink-850/50 hover:text-ink-100 cursor-pointer shadow-sm"
          >
            I have an invite code
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen("create")}>
            New circle
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpen("join")}>
            Join with code
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
          {error && <p role="alert" className="text-xs text-crit">{error}</p>}
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
