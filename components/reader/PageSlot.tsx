"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "@/lib/pdf";
import type { HighlightDTO } from "@/lib/serialize";
import { PdfPage } from "./PdfPage";
import { HighlightLayer } from "./HighlightLayer";

/**
 * A lazily-mounted page.
 *
 * Rendering every page of a 400-page textbook at once would allocate a canvas
 * per page and die. Each slot reserves its space with a placeholder sized by
 * the document's aspect ratio, then mounts the real page only when it comes
 * near the viewport — so scrolling stays smooth and scrollbar height stays
 * honest.
 */
export function PageSlot({
  doc,
  pageNumber,
  scale,
  aspect,
  highlights,
  activeId,
  onSelectHighlight,
  onVisible,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  aspect: number;
  highlights: HighlightDTO[];
  activeId: string | null;
  onSelectHighlight: (id: string) => void;
  onVisible: (page: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(pageNumber <= 2);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Mount when near the viewport (one screen of lookahead).
  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;
    const io = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && setMounted(true),
      { rootMargin: "100% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  // Report "you're reading this page" only when it dominates the viewport,
  // so a page barely peeking in at the bottom doesn't advance progress.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.intersectionRatio > 0.5) onVisible(pageNumber);
      },
      { threshold: [0.5] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pageNumber, onVisible]);

  // Bail out when the size is unchanged. A fresh {width,height} object is
  // never Object.is-equal, so without this guard every re-render of the page
  // would re-render this slot too, for no visible change.
  const handleSize = useCallback((s: { width: number; height: number }) => {
    setSize((prev) =>
      prev.width === s.width && prev.height === s.height ? prev : s
    );
  }, []);

  const placeholderWidth = 612 * scale;

  return (
    <div ref={ref} data-page-slot={pageNumber} className="scroll-mt-6">
      {mounted ? (
        <PdfPage
          doc={doc}
          pageNumber={pageNumber}
          scale={scale}
          onSizeChange={handleSize}
        >
          <HighlightLayer
            highlights={highlights}
            width={size.width}
            height={size.height}
            activeId={activeId}
            onSelect={onSelectHighlight}
          />
        </PdfPage>
      ) : (
        <div
          className="mx-auto flex items-center justify-center rounded-sm border border-ink-800 bg-ink-850"
          style={{ width: placeholderWidth, height: placeholderWidth * aspect }}
        >
          <span className="text-xs text-ink-600">{pageNumber}</span>
        </div>
      )}
    </div>
  );
}
