"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findPageElement, getTextOffsets, normalizeRects } from "@/lib/anchor";
import { pdfjs, type PDFDocumentProxy } from "@/lib/pdf";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/lib/types";
import type { HighlightDTO } from "@/lib/serialize";
import { useRealtime } from "@/hooks/useRealtime";
import { Button } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { PageSlot } from "./PageSlot";
import { SelectionPopover } from "./SelectionPopover";
import { ReaderToolbar } from "./ReaderToolbar";
import { Sidebar } from "./Sidebar";
import type { MilestoneInfo, MemberProgress } from "./types";

type PendingSelection = {
  pageNumber: number;
  rects: { x: number; y: number; w: number; h: number }[];
  text: string;
  start: number;
  end: number;
  anchor: { x: number; y: number };
};

export function Reader({
  documentId,
  circleId,
  circleSlug,
  title,
  author,
  pageCount,
  initialHighlights,
  initialPage,
  milestones,
  members,
  viewer,
  canShoutout,
}: {
  documentId: string;
  circleId: string;
  circleSlug: string;
  title: string;
  author: string | null;
  pageCount: number;
  initialHighlights: HighlightDTO[];
  initialPage: number;
  milestones: MilestoneInfo[];
  members: MemberProgress[];
  viewer: { id: string; name: string; avatarColor: string };
  /** Admin of a PUBLIC circle: shoutout control appears in threads. */
  canShoutout: boolean;
}) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.3);
  // Sticky across highlights: most people pick a colour once and keep going.
  const [color, setColor] = useState<HighlightColor>("yellow");

  // ── Focus mode ──────────────────────────────────────────
  // Entered deliberately — the deliberate entry is the pattern interrupt
  // (docs/RESEARCH.md §4). While active, the sidebar and Progress Match
  // disappear: one page, one job. Exiting shows what was BUILT (§5, §6).
  const [focus, setFocus] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recap, setRecap] = useState<{
    minutes: number;
    pages: number;
    highlights: number;
  } | null>(null);
  const session = useRef({ startedAt: 0, startPage: 1, highlights: 0 });
  const [highlights, setHighlights] = useState(initialHighlights);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [progress, setProgress] = useState(members);
  const [aspect, setAspect] = useState(792 / 612);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Load the PDF ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;

    const task = pdfjs.getDocument({
      url: `/api/documents/${documentId}/file`,
      withCredentials: true, // the file route is membership-gated
    });

    task.promise
      .then(async (d) => {
        if (cancelled) {
          await d.destroy();
          return;
        }
        loaded = d;
        setDoc(d);
        const page = await d.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        setAspect(vp.height / vp.width); // placeholder ratio for unrendered pages
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[Reader] load failed", err);
          setError("Couldn't load this PDF.");
        }
      });

    return () => {
      cancelled = true;
      task.destroy();
      loaded?.destroy();
    };
  }, [documentId]);

  // Auto-focus the scroll container when document loads so keyboard arrows work
  useEffect(() => {
    if (doc && scrollRef.current) {
      scrollRef.current.focus();
    }
  }, [doc]);

  // ── Live sync ───────────────────────────────────────────────
  const refetch = useCallback(async () => {
    const res = await fetch(`/api/documents/${documentId}/annotations`);
    if (!res.ok) return;
    const data = await res.json();
    setHighlights(data.highlights);
  }, [documentId]);

  useRealtime(circleId, (event) => {
    switch (event.type) {
      case "highlight:created":
      case "highlight:deleted":
      case "comment:created":
      case "comment:deleted":
        if (event.documentId === documentId) refetch();
        break;
      case "progress:updated":
        if (event.documentId === documentId) {
          setProgress((prev) =>
            prev.map((m) =>
              m.id === event.userId ? { ...m, currentPage: event.page } : m
            )
          );
        }
        break;
    }
  });

  // ── Selection capture ───────────────────────────────────────
  const captureSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setPending(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setPending(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const pageEl = findPageElement(range.startContainer);
    if (!pageEl) {
      setPending(null);
      return;
    }

    const pageNumber = Number(pageEl.dataset.pageNumber);
    const rects = normalizeRects(Array.from(range.getClientRects()), pageEl);
    if (rects.length === 0) {
      setPending(null);
      return;
    }

    const last = range.getClientRects()[range.getClientRects().length - 1]!;
    setPending({
      pageNumber,
      rects,
      text,
      ...getTextOffsets(pageEl, range),
      // Viewport coords for the popover only — never persisted.
      anchor: { x: last.left + last.width / 2, y: last.top },
    });
  }, []);

  useEffect(() => {
    const onUp = () => setTimeout(captureSelection, 0); // let selection settle
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, [captureSelection]);

  // ── Create a highlight ──────────────────────────────────────
  async function createHighlight(color: HighlightColor) {
    if (!pending) return;
    const snapshot = pending;
    setPending(null);
    window.getSelection()?.removeAllRanges();

    const res = await fetch("/api/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId,
        pageNumber: snapshot.pageNumber,
        rects: snapshot.rects,
        textContent: snapshot.text,
        textStart: snapshot.start,
        textEnd: snapshot.end,
        color,
      }),
    });

    if (!res.ok) return;
    const { id } = await res.json();
    session.current.highlights += 1;
    await refetch();
    // In focus mode the sidebar is hidden — opening the thread would yank the
    // reader out of the page. The mark itself is the confirmation.
    if (!focus) setActiveId(id);
  }

  // ── Focus session lifecycle ─────────────────────────────
  useEffect(() => {
    if (!focus) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - session.current.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [focus]);

  function startFocus() {
    session.current = {
      startedAt: Date.now(),
      startPage: currentPage,
      highlights: 0,
    };
    setElapsed(0);
    setActiveId(null);
    setFocus(true);
  }

  function endFocus() {
    setFocus(false);
    setRecap({
      minutes: Math.max(1, Math.round((Date.now() - session.current.startedAt) / 60000)),
      pages: Math.max(0, currentPage - session.current.startPage),
      highlights: session.current.highlights,
    });
  }

  // ── Track which page is being read ──────────────────────────
  const reportPage = useRef(initialPage);
  const onPageVisible = useCallback(
    (page: number) => {
      setCurrentPage(page);
      // Only ever report forward movement; the server enforces this too.
      if (page <= reportPage.current) return;
      reportPage.current = page;
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, currentPage: page }),
      }).catch(() => {});
      setProgress((prev) =>
        prev.map((m) =>
          m.id === viewer.id ? { ...m, currentPage: Math.max(m.currentPage, page) } : m
        )
      );
    },
    [documentId, viewer.id]
  );

  const scrollToPage = useCallback((page: number) => {
    scrollRef.current
      ?.querySelector(`[data-page-slot="${page}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const activeHighlight = useMemo(
    () => highlights.find((h) => h.id === activeId) ?? null,
    [highlights, activeId]
  );

  const myProgress = progress.find((m) => m.id === viewer.id)?.currentPage ?? 1;
  const total = doc?.numPages ?? pageCount;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ReaderToolbar
        title={title}
        author={author}
        circleSlug={circleSlug}
        currentPage={currentPage}
        pageCount={total}
        scale={scale}
        onScale={setScale}
        onJump={scrollToPage}
        members={progress}
        viewerId={viewer.id}
        focus={focus}
        elapsed={elapsed}
        onStartFocus={startFocus}
        onEndFocus={endFocus}
      />

      <div className="flex min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-ink-900 px-6 py-8 outline-none"
          onScroll={() => pending && setPending(null)}
          data-lenis-prevent
          tabIndex={0}
        >
          {error ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : !doc ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-ink-500">Loading {title}…</p>
            </div>
          ) : (
            <div className="mx-auto flex flex-col items-center gap-6">
              {Array.from({ length: doc.numPages }, (_, i) => i + 1).map((n) => (
                <PageSlot
                  key={n}
                  doc={doc}
                  pageNumber={n}
                  scale={scale}
                  aspect={aspect}
                  highlights={highlights.filter((h) => h.pageNumber === n)}
                  activeId={activeId}
                  onSelectHighlight={setActiveId}
                  onVisible={onPageVisible}
                />
              ))}
            </div>
          )}
        </div>

        {/* Focus mode: one page, one job. The margin conversation is one
            click away again the moment the session ends. */}
        {!focus && (
          <Sidebar
            documentId={documentId}
            circleId={circleId}
            highlights={highlights}
            activeHighlight={activeHighlight}
            onSelect={setActiveId}
            onJump={scrollToPage}
            onRefetch={refetch}
            viewer={viewer}
            milestones={milestones}
            myProgress={myProgress}
            canShoutout={canShoutout}
          />
        )}
      </div>

      {recap && <FocusRecap {...recap} onClose={() => setRecap(null)} />}

      {pending && (
        <SelectionPopover
          anchor={pending.anchor}
          text={pending.text}
          colors={HIGHLIGHT_COLORS}
          activeColor={color}
          onPickColor={setColor}
          onCommit={createHighlight}
          onDismiss={() => setPending(null)}
        />
      )}
    </div>
  );
}

/**
 * The session recap: what was BUILT, not what was spent.
 *
 * Forest's insight socialised (RESEARCH.md §5–6): show output — pages,
 * highlights, minutes — and stop there. No streaks-at-risk guilt, no
 * "come back tomorrow" hook, no comparison to anyone else. The session
 * ended; that is a feature.
 */
function FocusRecap({
  minutes,
  pages,
  highlights,
  onClose,
}: {
  minutes: number;
  pages: number;
  highlights: number;
  onClose: () => void;
}) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Session complete"
      description="Built, not spent."
    >
      <div className="grid grid-cols-3 gap-2 text-center">
        {(
          [
            [minutes, minutes === 1 ? "minute" : "minutes"],
            [pages, pages === 1 ? "page" : "pages"],
            [highlights, highlights === 1 ? "highlight" : "highlights"],
          ] as const
        ).map(([n, label]) => (
          <div
            key={label}
            className="rounded-lg border border-ink-800 bg-ink-850 px-2 py-3"
          >
            <p className="text-grad text-3xl font-semibold [font-variant-numeric:lining-nums_tabular-nums]">
              {n}
            </p>
            <p className="mt-0.5 text-2xs uppercase tracking-[0.12em] text-ink-500">
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Done for now
        </Button>
        <Button size="sm" onClick={onClose}>
          Keep reading
        </Button>
      </div>
    </Modal>
  );
}
