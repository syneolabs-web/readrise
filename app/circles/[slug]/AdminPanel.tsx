"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Card, Textarea } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { IconTrash } from "@/components/icons";

type Member = {
  userId: string;
  name: string;
  avatarColor: string;
  role: string;
};

/**
 * Admin moderation. Visible only to the circle admin, only once public —
 * a private circle of friends does not need a removal tool, and showing one
 * would change how the room feels.
 *
 * Removal demands a written reason, which is stored. The admin is a peer,
 * not staff; a record is what keeps that honest.
 */
export function AdminPanel({
  circleId,
  members,
  viewerId,
}: {
  circleId: string;
  members: Member[];
  viewerId: string;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<Member | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/circles/members/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circleId, userId: target.userId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setTarget(null);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const removable = members.filter((m) => m.role !== "owner" && m.userId !== viewerId);

  return (
    <>
      <section className="mt-6">
        <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
          Members · admin
        </h2>
        <Card className="mt-3 divide-y divide-ink-850">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar name={m.name} color={m.avatarColor} size={24} />
              <p className="min-w-0 flex-1 truncate text-sm text-ink-200">
                {m.name}
                {m.role === "owner" && (
                  <span className="ml-2 rounded border border-accent/25 bg-accent/10 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-accent">
                    Admin
                  </span>
                )}
              </p>
              {removable.some((r) => r.userId === m.userId) && (
                <Button variant="danger" size="sm" onClick={() => setTarget(m)}>
                  <IconTrash size={12} />
                  Remove
                </Button>
              )}
            </div>
          ))}
        </Card>
        <p className="mt-2 text-2xs leading-relaxed text-ink-600">
          Removing someone also blocks them from rejoining this circle. The
          reason you give is recorded.
        </p>
      </section>

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={`Remove ${target?.name ?? ""}?`}
        description="They lose access immediately and can't rejoin. Their highlights and replies stay."
      >
        <form onSubmit={remove} className="space-y-3">
          <Textarea
            autoFocus
            rows={3}
            placeholder="Why are you removing them? (recorded)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          {error && <p className="text-xs text-crit">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" disabled={busy || reason.trim().length < 4}>
              {busy ? "…" : "Remove member"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
