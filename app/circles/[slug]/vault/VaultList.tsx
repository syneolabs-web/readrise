"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Button, Card, Empty, Input } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { COLOR_STYLES, type HighlightColor } from "@/lib/types";
import { formatWeek, relativeTime } from "@/lib/utils";

type Entry = {
  id: string;
  note: string | null;
  createdAt: string;
  addedBy: { id: string; name: string; avatarColor: string };
  highlight: {
    id: string;
    text: string;
    color: string;
    page: number;
    author: string;
    documentId: string;
    documentTitle: string;
    documentAuthor: string | null;
    comments: { author: string; body: string }[];
  } | null;
  action: {
    title: string;
    detail: string | null;
    weekOf: string;
    checkins: number;
  } | null;
};

export function VaultList({
  entries,
  viewerId,
}: {
  entries: Entry[];
  viewerId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "highlights" | "actions">("all");

  // Client-side search: a circle's vault is tens of entries, not thousands.
  // Postgres FTS is the obvious upgrade if that ever stops being true.
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return entries.filter((e) => {
      if (filter === "highlights" && !e.highlight) return false;
      if (filter === "actions" && !e.action) return false;
      if (!q) return true;
      return [
        e.note,
        e.highlight?.text,
        e.highlight?.documentTitle,
        e.highlight?.author,
        e.action?.title,
        e.action?.detail,
        e.addedBy.name,
      ]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q));
    });
  }, [entries, query, filter]);

  async function remove(id: string) {
    await fetch(`/api/vault/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search every insight…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {(
            [
              ["all", "All"],
              ["highlights", "Highlights"],
              ["actions", "Actions"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "rounded-md bg-ink-800 px-2.5 py-1.5 text-xs font-medium text-ink-100"
                  : "rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:text-ink-300"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-ink-600">
          {filtered.length} of {entries.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-4 border-dashed">
          <Empty
            title={entries.length === 0 ? "The vault is empty" : "Nothing matches"}
            hint={
              entries.length === 0
                ? "Open a book, highlight something that mattered, and hit Vault. It'll live here forever."
                : "Try a different search."
            }
          />
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((e) => {
            const color =
              (e.highlight && COLOR_STYLES[e.highlight.color as HighlightColor]) ||
              COLOR_STYLES.yellow;

            return (
              <Card key={e.id} className="group p-5">
                {e.highlight ? (
                  <>
                    <blockquote
                      className="rounded-r border-l-2 py-1 pl-4 font-prose text-sm leading-relaxed text-ink-100"
                      style={{ borderColor: color.solid }}
                    >
                      {e.highlight.text}
                    </blockquote>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-600">
                      <Link
                        href={`/read/${e.highlight.documentId}`}
                        className="font-medium text-ink-400 transition-colors hover:text-accent"
                      >
                        {e.highlight.documentTitle}
                      </Link>
                      {e.highlight.documentAuthor && (
                        <span>· {e.highlight.documentAuthor}</span>
                      )}
                      <span>· p{e.highlight.page}</span>
                      <span>· highlighted by {e.highlight.author}</span>
                    </div>

                    {e.highlight.comments.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-l border-ink-800 pl-3">
                        {e.highlight.comments.map((c, i) => (
                          <p key={i} className="text-xs leading-relaxed text-ink-500">
                            <span className="font-medium text-ink-400">
                              {c.author}:
                            </span>{" "}
                            {c.body}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                ) : e.action ? (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 shrink-0 text-accent">
                        <IconCheck size={13} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink-100">
                          {e.action.title}
                        </p>
                        {e.action.detail && (
                          <p className="mt-1 text-xs leading-relaxed text-ink-500">
                            {e.action.detail}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-2xs text-ink-600">
                      Micro-Action · week of {formatWeek(e.action.weekOf)} ·{" "}
                      {e.action.checkins}{" "}
                      {e.action.checkins === 1 ? "check-in" : "check-ins"}
                    </p>
                  </>
                ) : null}

                {e.note && (
                  <p className="mt-3 rounded-lg bg-ink-850 px-3 py-2 text-xs leading-relaxed text-ink-300">
                    {e.note}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2 border-t border-ink-850 pt-3">
                  <Avatar
                    name={e.addedBy.name}
                    color={e.addedBy.avatarColor}
                    size={16}
                  />
                  <span className="text-2xs text-ink-600">
                    Vaulted by {e.addedBy.name} · {relativeTime(e.createdAt)}
                  </span>
                  {e.addedBy.id === viewerId && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => remove(e.id)}
                      className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
