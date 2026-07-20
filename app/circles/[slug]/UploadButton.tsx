"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button, Input } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { readPageCount } from "@/lib/pdf";
import { suggestGoalDays } from "@/lib/reading-goal";

const EMPTY = { title: "", author: "", goalDays: "", goalRitual: "" };

export function UploadButton({ circleId }: { circleId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;

    setError(null);
    setFile(picked);
    // Default the title to the filename — usually close enough to edit.
    setForm({ ...EMPTY, title: picked.name.replace(/\.pdf$/i, "") });

    // Read the page count here rather than server-side: pdf.js is already in
    // the client bundle, and this avoids running it in the Node runtime where
    // it drags in a native canvas dependency. It's the progress denominator,
    // not a security boundary — the server clamps it anyway.
    try {
      const pages = await readPageCount(picked);
      setPageCount(pages);
      // Pre-fill rather than leave blank: an empty field asks the reader to
      // invent a number and most will skip it, and a skipped goal is the one
      // that never gets set. A suggested default is easy to overwrite.
      setForm((f) => ({ ...f, goalDays: String(suggestGoalDays(pages)) }));
    } catch {
      setError("That file doesn't look like a readable PDF.");
      setFile(null);
    }
  }

  function reset() {
    setFile(null);
    setPageCount(null);
    setForm(EMPTY);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);

    const body = new FormData();
    body.set("file", file);
    body.set("circleId", circleId);
    body.set("title", form.title);
    body.set("author", form.author);
    body.set("pageCount", String(pageCount ?? 0));
    body.set("goalDays", form.goalDays);
    body.set("goalRitual", form.goalRitual);

    try {
      const res = await fetch("/api/documents", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      reset();
      router.push(`/read/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setBusy(false);
    }
  }

  // Live pace preview: the number that makes an abstract deadline feel real
  // (or honestly unrealistic) *before* it's committed to.
  const days = Number(form.goalDays);
  const pace =
    pageCount && Number.isFinite(days) && days > 0
      ? Math.ceil(pageCount / days)
      : null;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={pick}
        className="hidden"
      />
      <Button size="sm" onClick={() => inputRef.current?.click()}>
        Upload a book
      </Button>

      <Modal
        open={file !== null}
        onClose={reset}
        title="Add this book"
        description={
          pageCount
            ? `${pageCount} pages · everyone in the circle will see it.`
            : "Reading the file…"
        }
      >
        <form onSubmit={upload} className="space-y-3">
          <Input
            autoFocus
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Input
            placeholder="Author (optional)"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          />
          {/* The goal block. Separated by a rule because it's a different kind
              of question — the two above describe the book, these two describe
              the commitment. */}
          <div className="space-y-2 border-t border-ink-800 pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="goalDays" className="text-xs text-ink-300">
                Finish it in
              </label>
              {pace !== null && (
                <span className="text-2xs text-ink-400">
                  ≈ {pace} pages a day
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="goalDays"
                type="number"
                min={1}
                max={365}
                inputMode="numeric"
                className="w-24"
                value={form.goalDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goalDays: e.target.value }))
                }
              />
              <span className="text-sm text-ink-300">days</span>
              {form.goalDays !== "" && (
                <button
                  type="button"
                  // No goal is a legitimate choice, not a failure to decide —
                  // so it gets a real control, not a blank you must clear.
                  onClick={() => setForm((f) => ({ ...f, goalDays: "" }))}
                  className="ml-auto text-2xs text-ink-400 underline underline-offset-2 hover:text-ink-200"
                >
                  No deadline
                </button>
              )}
            </div>
            <Input
              placeholder="When will you read? e.g. after dinner (optional)"
              value={form.goalRitual}
              onChange={(e) =>
                setForm((f) => ({ ...f, goalRitual: e.target.value }))
              }
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy || !form.title.trim()}>
              {busy ? "Uploading…" : "Add book"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
