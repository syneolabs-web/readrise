import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Copy the pdf.js worker into public/ so it can be served at a stable URL.
 *
 * Bundling the worker through webpack's `new URL(..., import.meta.url)` path
 * works until it doesn't (turbopack vs webpack, dev vs build, ESM interop).
 * A plain file at a known URL has no such failure modes, and the worker is a
 * self-contained artifact that gains nothing from bundling.
 *
 * Runs on postinstall and before dev/build. See lib/pdf.ts.
 */

const src = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const destDir = path.join(process.cwd(), "public");
const dest = path.join(destDir, "pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.error(`✗ pdf.js worker not found at ${src} — is pdfjs-dist installed?`);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("✓ pdf.js worker → public/pdf.worker.min.mjs");
