/**
 * A minimal, dependency-free PDF writer used only by the seed.
 *
 * Why hand-roll: the seed needs a PDF with a REAL text layer so pdf.js can
 * extract text and the highlight engine is exercisable the moment you log in.
 * An image-only or fake PDF would make the core feature untestable, and
 * pulling a PDF generation library in as a prod dependency to seed dev data
 * is a bad trade. This is ~90 lines and never ships to the client.
 */

import { textWidth } from "./helvetica-metrics";

export const PAGE_W = 612; // US Letter, points
export const PAGE_H = 792;
export const MARGIN = 72;
export const BODY_SIZE = 11;
export const HEADING_SIZE = 15;
export const BODY_LEADING = 16;
export const HEADING_LEADING = 20;

export type PdfLine = { text: string; heading?: boolean };

/** PDF strings are wrapped in parens, so those and backslashes must escape. */
function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function contentStream(lines: PdfLine[]): string {
  const out: string[] = [
    "BT",
    `1 0 0 1 ${MARGIN} ${PAGE_H - MARGIN} Tm`,
    `${BODY_LEADING} TL`,
  ];
  for (const line of lines) {
    if (line.heading) {
      out.push(`/F2 ${HEADING_SIZE} Tf`, `${HEADING_LEADING} TL`);
    } else {
      out.push(`/F1 ${BODY_SIZE} Tf`, `${BODY_LEADING} TL`);
    }
    out.push(`(${escapeText(line.text)}) Tj`, "T*");
  }
  out.push("ET");
  return out.join("\n");
}

export function buildPdf(pages: PdfLine[][]): Buffer {
  const objects: string[] = [];
  const add = (body: string) => objects.push(body); // returns nothing; index+1 = obj num

  const pageCount = pages.length;
  // 1 catalog, 2 pages, 3 font, 4 bold font, then 2 objects per page.
  const firstPageObj = 5;
  const kids = pages
    .map((_, i) => `${firstPageObj + i * 2} 0 R`)
    .join(" ");

  add(`<< /Type /Catalog /Pages 2 0 R >>`);
  add(`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);
  add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);

  pages.forEach((lines, i) => {
    const contentObj = firstPageObj + i * 2 + 1;
    add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`
    );
    const stream = contentStream(lines);
    add(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
  });

  // Serialize, tracking byte offsets for the xref table.
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

/**
 * Greedy wrap at the real measured width of the text column.
 *
 * Measured, not character-counted: Helvetica is proportional, so "Illinois"
 * and "mumbling" occupy very different widths at the same length. The seed
 * derives highlight rects from these same metrics, so wrapping and anchoring
 * agree exactly.
 */
export function wrap(
  text: string,
  fontSize = BODY_SIZE,
  bold = false,
  maxWidth = PAGE_W - MARGIN * 2
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (cur && textWidth(candidate, fontSize, bold) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
