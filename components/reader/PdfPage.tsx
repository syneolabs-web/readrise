"use client";

import { useEffect, useRef, useState } from "react";
import { pdfjs, type PDFDocumentProxy } from "@/lib/pdf";

/**
 * Renders one PDF page: glyphs to <canvas>, then pdf.js's invisible text
 * layer on top so the browser's native selection works.
 *
 * The text layer is why we can use window.getSelection() at all — the canvas
 * alone is just pixels with no selectable text.
 */
export function PdfPage({
  doc,
  pageNumber,
  scale,
  onSizeChange,
  children,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  /** Rendered CSS size — the highlight layer multiplies its fractions by this. */
  onSizeChange?: (size: { width: number; height: number }) => void;
  children?: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [rendering, setRendering] = useState(true);

  // Held in a ref so it is NOT an effect dependency. Callers naturally pass an
  // inline arrow, whose identity changes every render; as a dependency it would
  // re-trigger this effect, which reports a size, which re-renders the caller,
  // which makes a new arrow — an unbounded loop that re-rasterizes the canvas
  // forever and pegs the CPU.
  const onSize = useRef(onSizeChange);
  onSize.current = onSizeChange;

  useEffect(() => {
    let cancelled = false;
    let renderTask: pdfjs.RenderTask | null = null;
    let textLayer: pdfjs.TextLayer | null = null;

    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const textContainer = textRef.current;
      if (!canvas || !textContainer) return;

      // Render at device resolution so text is crisp on retina, but lay the
      // canvas out at CSS size. The highlight layer only ever sees CSS size,
      // which is exactly why DPI can't corrupt anchoring.
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const next = { width: viewport.width, height: viewport.height };
      setSize(next);
      onSize.current?.(next);

      renderTask = page.render({
        canvasContext: ctx,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        // pdf.js fills the canvas white by default, which would hide the paper
        // colour behind it. Transparent lets the page's `bg-paper` show through
        // wherever the PDF itself paints no background — the common case for
        // text books. (A PDF that paints its own white page can't be recoloured
        // this way; that's an accepted limitation.)
        background: "transparent",
      });

      try {
        await renderTask.promise;
      } catch (err) {
        // Cancellation is the normal path when scale changes mid-render.
        if ((err as Error)?.name !== "RenderingCancelledException") throw err;
        return;
      }
      if (cancelled) return;

      textContainer.replaceChildren();
      textLayer = new pdfjs.TextLayer({
        textContentSource: await page.getTextContent(),
        container: textContainer,
        viewport,
      });
      await textLayer.render();

      if (!cancelled) setRendering(false);
    })().catch((err) => {
      if (!cancelled) console.error(`[PdfPage ${pageNumber}]`, err);
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
      textLayer?.cancel();
    };
    // onSizeChange is intentionally excluded — see the onSize ref above.
  }, [doc, pageNumber, scale]);

  return (
    <div
      data-page-number={pageNumber}
      className="pdf-page-container relative mx-auto bg-paper shadow-2xl shadow-black/40"
      style={
        {
          width: size.width || undefined,
          height: size.height || undefined,
          // REQUIRED by pdf.js. Its text-layer spans size themselves with
          // `font-size: calc(var(--scale-factor) * Npx)`. Without this var the
          // calc() is invalid, font-size silently falls back to the inherited
          // 16px, and the invisible selectable text renders ~12% wider than the
          // glyphs painted on the canvas.
          //
          // The failure is vicious because the page still LOOKS perfect — the
          // canvas is correct. Only selection is wrong, and the error grows
          // left-to-right, so short selections near the margin seem fine and
          // long ones silently capture the wrong text.
          "--scale-factor": scale,
        } as React.CSSProperties
      }
    >
      <canvas ref={canvasRef} className="pdf-canvas block" />
      <div ref={textRef} className="textLayer" />
      {/* Highlight layer renders above the canvas but below the text layer,
          so selection keeps working over an existing highlight. */}
      {children}
      {rendering && (
        // z-3: above the highlight layer (1) and text layer (2), so a
        // half-painted page never shows highlights floating on blank space.
        <div
          className="pdf-page-container absolute inset-0 flex items-center justify-center bg-paper"
          style={{ zIndex: 3 }}
        >
          <span className="text-xs text-paper-ink/40">
            Rendering page {pageNumber}…
          </span>
        </div>
      )}
    </div>
  );
}
