"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Card } from "@/components/ui";
import { IconCheck, IconClose } from "@/components/icons";
import { useRealtime } from "@/hooks/useRealtime";
import { cn } from "@/lib/utils";

type ProposalState = {
  id: string;
  proposedBy: { id: string; name: string };
  memberCount: number;
  votes: { userId: string; name: string; avatarColor: string; approve: boolean }[];
  pending: { id: string; name: string; avatarColor: string }[];
};

/**
 * The motion to go public, and its tally.
 *
 * The copy leads with the consequence, not the feature: members are agreeing
 * to expose everything they already wrote in private, and the UI should say
 * so before it asks for a click.
 */
export function PublishVote({
  circleId,
  isPublic,
  proposal,
  viewerId,
  memberCount,
}: {
  circleId: string;
  isPublic: boolean;
  proposal: ProposalState | null;
  viewerId: string;
  memberCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useRealtime(circleId, (e) => {
    if (e.type === "circle:updated") router.refresh();
  });

  if (isPublic) return null;

  async function post(url: string, body: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!proposal) {
    return (
      <div>
        <h3 className="cover-label text-base font-bold text-ink-100">Make this circle public?</h3>
        <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-ink-400">
          A public circle appears in Discover and anyone can join. Everything
          you&apos;ve already written here — every highlight, every thread —
          becomes visible to strangers. It takes a{" "}
          <strong className="text-ink-300">
            unanimous yes from all <span className="tabular-nums">{memberCount}</span>{" "}
            {memberCount === 1 ? "member" : "members"}
          </strong>
          , and one no ends it.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          disabled={busy}
          onClick={() => post("/api/circles/publish", { circleId })}
        >
          Start the vote
        </Button>
        {error && <p role="alert" className="mt-2 text-xs text-crit">{error}</p>}
      </div>
    );
  }

  const myVote = proposal.votes.find((v) => v.userId === viewerId);
  const yes = proposal.votes.filter((v) => v.approve).length;
  const no = proposal.votes.filter((v) => !v.approve).length;

  return (
    <Card className="border-l-0 border-t-[3px] border-t-series p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="cover-label text-lg font-bold text-ink-100">
          Vote: make this circle public
        </h2>
        <span className="fig cover-label rounded-full bg-series px-3 py-1 text-xs font-bold text-series-ink shadow-sm">
          {yes} of {proposal.memberCount} yes
        </span>
      </div>
      <p className="mt-1.5 text-sm text-ink-400">
        Proposed by {proposal.proposedBy.name}. Needs every member to agree —
        one no ends it.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          {proposal.votes.map((v) => (
            <span
              key={v.userId}
              title={`${v.name} — ${v.approve ? "yes" : "no"}`}
              className="relative"
            >
              <Avatar name={v.name} color={v.avatarColor} size={22} />
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 grid h-3 w-3 place-items-center rounded-full ring-2 ring-ink-900",
                  v.approve ? "bg-good text-ink-950" : "bg-crit text-ink-950"
                )}
              >
                {v.approve ? <IconCheck size={7} /> : <IconClose size={7} />}
              </span>
            </span>
          ))}
          {proposal.pending.map((p) => (
            <span key={p.id} title={`${p.name} — hasn't voted`} className="opacity-30">
              <Avatar name={p.name} color={p.avatarColor} size={22} />
            </span>
          ))}
        </div>
        {no > 0 && (
          <span className="text-2xs text-crit">
            {no} objection{no === 1 ? "" : "s"} — the motion will not carry
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          size="sm"
          disabled={busy}
          className={myVote?.approve ? "" : "opacity-70"}
          onClick={() => post("/api/circles/publish/vote", { proposalId: proposal.id, approve: true })}
        >
          <IconCheck size={13} />
          {myVote?.approve ? "You voted yes" : "Vote yes"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => post("/api/circles/publish/vote", { proposalId: proposal.id, approve: false })}
        >
          <IconClose size={13} />
          {myVote && !myVote.approve ? "You voted no" : "Vote no"}
        </Button>
        <span className="text-2xs text-ink-600">You can change your vote until it closes.</span>
      </div>
      {error && <p className="mt-2 text-xs text-crit">{error}</p>}
    </Card>
  );
}
