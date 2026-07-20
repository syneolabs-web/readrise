"use client";

import * as pdfjs from "pdfjs-dist";

/**
 * Single place where pdf.js is configured.
 *
 * The worker is served as a static file from public/ (copied there by
 * scripts/copy-pdf-worker.ts) rather than bundled — see that script for why.
 */
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export { pdfjs };
export type PDFDocumentProxy = pdfjs.PDFDocumentProxy;
export type PDFPageProxy = pdfjs.PDFPageProxy;

/** Read a PDF's page count client-side, so uploads know their length. */
export async function readPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const { numPages } = doc;
  await doc.destroy();
  return numPages;
}
