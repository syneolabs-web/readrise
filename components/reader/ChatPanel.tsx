"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Button, Input } from "@/components/ui";
import { IconLock } from "@/components/icons";
import { useRealtime } from "@/hooks/useRealtime";
import { cn, relativeTime } from "@/lib/utils";
import type { MilestoneInfo } from "./types";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; avatarColor: string };
};

/**
 * The Lounge plus one room per milestone.
 *
 * Spoiler gating: a milestone room is locked until your OWN progress reaches
 * its end page. Enforced server-side in /api/chat too — a hidden button is
 * not a rule.
 */
export function ChatPanel({
  circleId,
  documentId,
  milestones,
  myProgress,
  viewer,
}: {
  circleId: string;
  documentId: string;
  milestones: MilestoneInfo[];
  myProgress: number;
  viewer: { id: string; name: string; avatarColor: string };
}) {
  const [room, setRoom] = useState<string | null>(null); // null = Lounge
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const url = `/api/chat/${circleId}${room ? `?milestoneId=${room}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages);
    setLoading(false);
  }, [circleId, room]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useRealtime(circleId, (event) => {
    if (event.type === "chat:created" && event.milestoneId === room) load();
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const active = milestones.find((m) => m.id === room);
  const locked = active ? myProgress < active.endPage : false;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const text = body;
    setBody("");
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circleId, milestoneId: room, body: text }),
    });
    load();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Room switcher */}
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-ink-800 px-3 py-2">
        <RoomTab active={room === null} onClick={() => setRoom(null)} label="Lounge" />
        {milestones.map((m) => {
          const isLocked = myProgress < m.endPage;
          return (
            <RoomTab
              key={m.id}
              active={room === m.id}
              onClick={() => setRoom(m.id)}
              label={`Ch.${m.order + 1}`}
              locked={isLocked}
              title={
                isLocked
                  ? `${m.title} — locked until page ${m.endPage}`
                  : m.title
              }
            />
          );
        })}
      </div>

      {locked ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-8 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-ink-500">
            <IconLock size={18} />
          </span>
          <p className="text-sm font-medium text-ink-300">{active!.title}</p>
          <p className="max-w-[15rem] text-xs leading-relaxed text-ink-500">
            This room unlocks when you finish page {active!.endPage}. You&apos;re on
            page {myProgress}.
          </p>
          <p className="mt-1 text-2xs text-ink-600">
            No spoilers. Go read {active!.endPage - myProgress} more{" "}
            {active!.endPage - myProgress === 1 ? "page" : "pages"}.
          </p>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <p className="py-6 text-center text-xs text-ink-600">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-600">
                {room ? "Nobody's said anything about this chapter yet." : "Say hi."}
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="flex gap-2">
                    <Avatar
                      name={m.author.name}
                      color={m.author.avatarColor}
                      size={20}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] font-medium text-ink-300">
                          {m.author.id === viewer.id ? "You" : m.author.name}
                        </span>
                        <span className="text-[10px] text-ink-600">
                          {relativeTime(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-ink-300">
                        {m.body}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex shrink-0 gap-2 border-t border-ink-800 p-3">
            <Input
              placeholder={room ? "Discuss this chapter…" : "Message the circle…"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={!body.trim()}>
              Send
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

function RoomTab({
  active,
  onClick,
  label,
  title,
  locked = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
  locked?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
        "transition-colors duration-[120ms]",
        active
          ? "bg-ink-800 text-ink-100"
          : "text-ink-500 hover:bg-ink-900 hover:text-ink-300"
      )}
    >
      {/* The lock is state, so it carries a name rather than being decorative. */}
      {locked && <IconLock size={11} label="Locked" />}
      {label}
    </button>
  );
}
