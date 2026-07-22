"use client";

import { useState } from "react";
import { Avatar, Button, Empty, Textarea } from "@/components/ui";
import {
  IconBack,
  IconMegaphone,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconUpvote,
} from "@/components/icons";
import { COLOR_STYLES } from "@/lib/types";
import { cn, relativeTime, truncate } from "@/lib/utils";
import type { HighlightDTO } from "@/lib/serialize";

export function ThreadPanel({
  circleId,
  highlights,
  activeHighlight,
  onSelect,
  onJump,
  onRefetch,
  viewer,
  canShoutout,
}: {
  circleId: string;
  highlights: HighlightDTO[];
  activeHighlight: HighlightDTO | null;
  onSelect: (id: string | null) => void;
  onJump: (page: number) => void;
  onRefetch: () => void;
  viewer: { id: string; name: string; avatarColor: string };
  /** Admin of a PUBLIC circle: may broadcast a shoutout. */
  canShoutout: boolean;
}) {
  if (activeHighlight) {
    return (
      <Thread
        circleId={circleId}
        highlight={activeHighlight}
        onBack={() => onSelect(null)}
        onJump={onJump}
        onRefetch={onRefetch}
        viewer={viewer}
        canShoutout={canShoutout}
      />
    );
  }

  if (highlights.length === 0) {
    return (
      <Empty
        title="No highlights yet"
        hint="Select any sentence in the page to highlight it and start a thread in the margin."
      />
    );
  }

  const ordered = [...highlights].sort(
    (a, b) =>
      a.pageNumber - b.pageNumber || (a.rects[0]?.y ?? 0) - (b.rects[0]?.y ?? 0)
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {ordered.map((h) => (
        <button
          key={h.id}
          onClick={() => {
            onSelect(h.id);
            onJump(h.pageNumber);
          }}
          className="block w-full border-b border-ink-900 px-4 py-3 text-left transition-colors hover:bg-ink-900"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: COLOR_STYLES[h.color]?.solid }}
            />
            <Avatar name={h.author.name} color={h.author.avatarColor} size={16} />
            <span className="text-2xs font-medium text-ink-400">
              {h.author.name}
            </span>
            <span className="ml-auto text-2xs text-ink-600">p{h.pageNumber}</span>
          </div>

          <p className="mt-1.5 border-l-2 border-ink-700 pl-2 font-prose text-xs leading-snug text-ink-300">
            {truncate(h.textContent, 110)}
          </p>

          <div className="mt-1.5 flex items-center gap-2 text-2xs text-ink-600">
            {h.comments.length > 0 && (
              <span>
                {h.comments.length}{" "}
                {h.comments.length === 1 ? "reply" : "replies"}
              </span>
            )}
            {h.inVault && (
              <span className="inline-flex items-center gap-0.5 text-accent/70">
                <IconStarFilled size={9} />
                in Vault
              </span>
            )}
            <span className="ml-auto">{relativeTime(h.createdAt)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Thread({
  circleId,
  highlight,
  onBack,
  onJump,
  onRefetch,
  viewer,
  canShoutout,
}: {
  circleId: string;
  highlight: HighlightDTO;
  onBack: () => void;
  onJump: (page: number) => void;
  onRefetch: () => void;
  viewer: { id: string; name: string; avatarColor: string };
  /** Admin of a PUBLIC circle: may broadcast a shoutout. */
  canShoutout: boolean;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [shouting, setShouting] = useState(false);
  const [shouted, setShouted] = useState(false);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ highlightId: highlight.id, body }),
    });
    setBody("");
    setBusy(false);
    onRefetch();
  }

  async function pin() {
    setPinning(true);
    await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circleId, highlightId: highlight.id }),
    });
    setPinning(false);
    onRefetch();
  }

  async function remove() {
    await fetch(`/api/highlights/${highlight.id}`, { method: "DELETE" });
    onBack();
    onRefetch();
  }

  /** Admin-only, public circles only: broadcast this thinking to everyone. */
  async function shoutout() {
    setShouting(true);
    const res = await fetch("/api/shoutouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circleId, highlightId: highlight.id }),
    });
    setShouting(false);
    if (res.ok) setShouted(true);
  }

  const style = COLOR_STYLES[highlight.color] ?? COLOR_STYLES.yellow;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-ink-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-sm text-xs text-ink-500 transition-colors duration-[120ms] hover:text-ink-200"
          >
            <IconBack size={12} />
            All threads
          </button>
          <button
            onClick={() => onJump(highlight.pageNumber)}
            className="ml-auto text-2xs text-ink-600 transition-colors hover:text-accent"
          >
            Go to p{highlight.pageNumber}
          </button>
        </div>

        <blockquote
          className="mt-3 rounded-r border-l-2 py-1.5 pl-3 font-prose text-sm leading-relaxed text-ink-200"
          style={{ borderColor: style.solid, background: `${style.solid}0f` }}
        >
          {highlight.textContent}
        </blockquote>

        <div className="mt-2.5 flex items-center gap-2">
          <Avatar
            name={highlight.author.name}
            color={highlight.author.avatarColor}
            size={16}
          />
          <span className="text-2xs text-ink-500">
            {highlight.author.name} · {relativeTime(highlight.createdAt)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={pin}
              disabled={pinning || highlight.inVault}
              className={highlight.inVault ? "text-accent" : ""}
            >
              {/* Fill is the state. Same icon, not a different one. */}
              {highlight.inVault ? (
                <IconStarFilled size={12} />
              ) : (
                <IconStar size={12} />
              )}
              {highlight.inVault ? "Vaulted" : "Vault"}
            </Button>
            {/* Only the admin of a public circle can broadcast praise. */}
            {canShoutout && highlight.author.id !== viewer.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={shoutout}
                disabled={shouting || shouted}
                className={shouted ? "text-accent" : ""}
              >
                <IconMegaphone size={12} />
                {shouted ? "Shouted out" : "Shout out"}
              </Button>
            )}
            {highlight.author.id === viewer.id && (
              <Button variant="danger" size="sm" onClick={remove}>
                <IconTrash size={12} />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {highlight.comments.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-600">
            No replies yet. Say why this mattered.
          </p>
        ) : (
          <div className="space-y-3">
            {highlight.comments.map((c) => (
              <CommentRow key={c.id} comment={c} viewer={viewer} onRefetch={onRefetch} />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={post} className="shrink-0 border-t border-ink-800 p-3">
        <Textarea
          rows={2}
          placeholder="Add to the thread…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter is a newline. This is a chat, not an essay.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              post(e);
            }
          }}
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={busy || !body.trim()}>
            Reply
          </Button>
        </div>
      </form>
    </div>
  );
}

function CommentRow({
  comment,
  viewer,
  onRefetch,
}: {
  comment: HighlightDTO["comments"][number];
  viewer: { id: string };
  onRefetch: () => void;
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <Avatar name={comment.author.name} color={comment.author.avatarColor} size={18} />
        <span className="text-2xs font-medium text-ink-300">
          {comment.author.name}
        </span>
        <span className="text-2xs text-ink-600">
          {relativeTime(comment.createdAt)}
        </span>

        <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {comment.author.id === viewer.id && (
            <button
              onClick={async () => {
                await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
                onRefetch();
              }}
              className="text-2xs text-ink-600 transition-colors hover:text-red-400"
            >
              Delete
            </button>
          )}
        </div>

        <button
          onClick={async () => {
            await fetch(`/api/comments/${comment.id}/vote`, { method: "POST" });
            onRefetch();
          }}
          aria-pressed={comment.votedByMe}
          aria-label={`Upvote — ${comment.voteCount} so far`}
          className={cn(
            "ml-1 flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 fig text-2xs",
            "transition-colors duration-[120ms]",
            comment.votedByMe
              ? "bg-accent/15 text-accent"
              : "text-ink-600 hover:bg-ink-800 hover:text-ink-300"
          )}
        >
          <IconUpvote size={11} />
          {comment.voteCount > 0 ? comment.voteCount : ""}
        </button>
      </div>

      <p className="mt-1 pl-6 text-xs leading-relaxed whitespace-pre-wrap text-ink-300">
        {comment.body}
      </p>
    </div>
  );
}
