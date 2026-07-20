"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Modal } from "@/components/Modal";

/**
 * The circle's door key: always visible to members, rotatable by the owner.
 *
 * Two ways to share, because they suit different people: the bare CODE (read
 * it aloud, type it in) and an invite LINK (paste into a chat — it survives
 * the recipient not having an account yet, see app/join/[code]).
 *
 * Rotation is owner-only and confirmed, because it silently breaks every
 * link already sent — that consequence has to be stated before the click,
 * not discovered after it.
 */
export function InviteCode({
  code,
  circleId,
  isOwner,
}: {
  code: string;
  circleId: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const link =
    typeof window !== "undefined" ? `${window.location.origin}/join/${code}` : "";

  async function copy(what: "code" | "link") {
    try {
      await navigator.clipboard.writeText(what === "code" ? code : link);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard needs a secure context; the code is on screen regardless.
    }
  }

  async function rotate() {
    setBusy(true);
    await fetch("/api/circles/invite-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circleId }),
    });
    setBusy(false);
    setConfirming(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => copy("code")}
          title="Copy the invite code"
          className="rounded-md border border-ink-700 px-2.5 py-1.5 font-mono text-xs tracking-widest text-ink-200 transition-colors duration-[120ms] hover:border-accent/50 hover:text-accent"
        >
          {copied === "code" ? "Copied!" : code}
        </button>
        <Button variant="ghost" size="sm" onClick={() => copy("link")}>
          {copied === "link" ? "Link copied" : "Copy invite link"}
        </Button>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            New code
          </Button>
        )}
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Generate a new code?"
        description="Use this if the old code leaked. Everyone already in the circle stays in — only the door key changes."
      >
        <p className="rounded-md border border-warn/25 bg-warn/10 px-3 py-2 text-xs leading-relaxed text-ink-300">
          The current code <span className="font-mono tracking-widest">{code}</span>{" "}
          and every invite link you&apos;ve already shared will stop working
          immediately.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={rotate} disabled={busy}>
            {busy ? "…" : "Generate new code"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
