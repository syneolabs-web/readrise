"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Card, Input, Textarea } from "@/components/ui";
import { IconCheck, IconFlame } from "@/components/icons";
import { Modal } from "@/components/Modal";
import { useRealtime } from "@/hooks/useRealtime";
import { cn, formatWeek } from "@/lib/utils";

type Action = {
  id: string;
  title: string;
  detail: string | null;
  weekOf: string;
  createdBy: string;
  milestoneTitle: string | null;
  checkedInBy: string[];
};

type Member = { id: string; name: string; avatarColor: string };

/**
 * Micro-Actions — the COMMIT → CHECK IN half of the loop.
 *
 * This is the feature that makes Prodoxity a different product from Perusall
 * or Fable, both of which end at discussion. See docs/BLUEPRINT.md §1.
 */
export function MicroActions({
  circleId,
  documents,
  actions,
  members,
  viewerId,
  thisWeek,
  memberCount,
}: {
  circleId: string;
  documents: { id: string; title: string }[];
  actions: Action[];
  members: Member[];
  viewerId: string;
  thisWeek: string;
  memberCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", detail: "", documentId: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useRealtime(circleId, (e) => {
    if (e.type === "action:updated") router.refresh();
  });

  const current = actions.filter((a) => a.weekOf === thisWeek);
  const past = actions.filter((a) => a.weekOf !== thisWeek);

  // Streak: consecutive past weeks where every member checked in.
  const streak = countStreak(past, memberCount);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circleId,
          title: form.title,
          detail: form.detail || null,
          documentId: form.documentId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOpen(false);
      setForm({ title: "", detail: "", documentId: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string) {
    await fetch(`/api/actions/${id}/checkin`, { method: "POST" });
    router.refresh();
  }

  return (
    <>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
            This week
          </h2>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <IconFlame size={12} />
              {streak} week{streak === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {current.length === 0 ? (
          <Card className="mt-3 border-dashed p-4">
            <p className="text-xs leading-relaxed text-ink-500">
              No commitment this week. What&apos;s one concrete thing the chapter
              says you should actually do?
            </p>
            <Button size="sm" className="mt-3 w-full" onClick={() => setOpen(true)}>
              Commit to something
            </Button>
          </Card>
        ) : (
          <div className="mt-3 space-y-2">
            {current.map((a) => {
              const done = a.checkedInBy.includes(viewerId);
              const all = a.checkedInBy.length === memberCount;

              return (
                <Card
                  key={a.id}
                  className={cn("p-4", all && "border-accent/30 bg-accent/[0.04]")}
                >
                  <p className="text-sm font-medium leading-snug text-ink-100">
                    {a.title}
                  </p>
                  {a.detail && (
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                      {a.detail}
                    </p>
                  )}
                  {a.milestoneTitle && (
                    <p className="mt-1.5 text-[10px] text-ink-600">
                      from {a.milestoneTitle}
                    </p>
                  )}

                  {/* Who's in, who isn't. The social pressure IS the feature. */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {members.map((m) => {
                        const checked = a.checkedInBy.includes(m.id);
                        return (
                          <Avatar
                            key={m.id}
                            name={`${m.name} — ${checked ? "done" : "not yet"}`}
                            color={m.avatarColor}
                            size={20}
                            className={cn(
                              "ring-2 ring-ink-900 transition-opacity",
                              !checked && "opacity-25 grayscale"
                            )}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-ink-600">
                      {a.checkedInBy.length}/{memberCount}
                    </span>

                    <button
                      onClick={() => toggle(a.id)}
                      aria-pressed={done}
                      className={cn(
                        "ml-auto inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold",
                        "transition-colors duration-[120ms]",
                        done
                          ? "bg-accent/15 text-accent hover:bg-accent/25"
                          : "border border-ink-700 text-ink-400 hover:border-ink-600 hover:bg-ink-850 hover:text-ink-200"
                      )}
                    >
                      {done && <IconCheck size={12} />}
                      {done ? "Done" : "Mark done"}
                    </button>
                  </div>
                </Card>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setOpen(true)}
            >
              + Add another
            </Button>
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
              Past weeks
            </h2>
            <div className="mt-3 space-y-1.5">
              {past.slice(0, 5).map((a) => {
                const all = a.checkedInBy.length === memberCount;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-lg border border-ink-900 px-3 py-2"
                  >
                    {/* Shape carries the state as well as colour, so this
                        still reads without colour vision. */}
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                        all
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-ink-700 text-transparent"
                      )}
                      aria-label={all ? "Everyone checked in" : "Incomplete"}
                      role="img"
                    >
                      {all && <IconCheck size={9} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-ink-400">{a.title}</p>
                      <p className="text-[10px] text-ink-600">
                        week of {formatWeek(a.weekOf)} · {a.checkedInBy.length}/
                        {memberCount}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Commit to a Micro-Action"
        description="One concrete thing, small enough that you can't argue your way out of it on a bad day."
      >
        <form onSubmit={create} className="space-y-3">
          <Input
            autoFocus
            placeholder="Read one page before opening any app"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            rows={3}
            placeholder="Optional — the rule, the tripwire, what counts as done."
            value={form.detail}
            onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
          />
          {documents.length > 0 && (
            <select
              value={form.documentId}
              onChange={(e) => setForm((f) => ({ ...f, documentId: e.target.value }))}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-accent/60 focus:outline-none"
            >
              <option value="">Not tied to a book</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "…" : "Commit"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/**
 * Consecutive most-recent weeks where EVERY member checked in.
 * A week the whole circle didn't complete breaks the chain — the streak
 * belongs to the circle, not to individuals.
 */
function countStreak(past: Action[], memberCount: number): number {
  const byWeek = new Map<string, Action[]>();
  for (const a of past) {
    const list = byWeek.get(a.weekOf) ?? [];
    list.push(a);
    byWeek.set(a.weekOf, list);
  }

  const weeks = [...byWeek.keys()].sort().reverse();
  let streak = 0;
  for (const w of weeks) {
    const complete = byWeek
      .get(w)!
      .every((a) => a.checkedInBy.length === memberCount);
    if (!complete) break;
    streak++;
  }
  return streak;
}
