import { PrismaClient } from "@prisma/client";
import { parseRects } from "../lib/anchor";
import { textWidth } from "./helvetica-metrics";

/**
 * End-to-end check on the newest highlight: is the captured text COMPLETE, and
 * does its rect match where that exact text really sits on the page?
 *
 * This is the regression guard for the `--scale-factor` bug. When that CSS var
 * is missing, pdf.js's text layer renders ~12% wider than the canvas glyphs,
 * so the selection silently captures the wrong characters. Comparing the stored
 * rect against Helvetica's true advance widths catches it: if the text layer is
 * misaligned, the two disagree by roughly that 12%.
 *
 * Run: npx tsx scripts/verify-capture.ts
 */

const PAGE_W = 612;
const BODY_SIZE = 11;

const db = new PrismaClient();

(async () => {
  const h = await db.highlight.findFirst({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
  if (!h) {
    console.log("No highlights found.");
    return db.$disconnect();
  }

  const rects = parseRects(h.rects);
  const storedW = (rects[0]?.w ?? 0) * PAGE_W;
  const trueW = textWidth(h.textContent, BODY_SIZE);
  const errPct = ((storedW - trueW) / trueW) * 100;

  console.log("by        :", h.user.name, "| page", h.pageNumber);
  console.log("text      :", JSON.stringify(h.textContent));
  console.log("length    :", h.textContent.length, "chars");
  console.log("offsets   :", h.textStart, "->", h.textEnd, `(${h.textEnd - h.textStart})`);
  console.log("");
  console.log("stored rect width :", storedW.toFixed(1), "pt");
  console.log("Helvetica truth   :", trueW.toFixed(1), "pt");
  console.log("error             :", errPct.toFixed(2) + "%");
  console.log("");

  // A single-line selection should agree within a couple of percent. The
  // scale-factor bug produced ~12%.
  const aligned = Math.abs(errPct) < 3;
  const lengthsAgree = Math.abs(h.textEnd - h.textStart - h.textContent.length) <= 1;

  console.log(aligned ? "✓ text layer aligned to canvas" : "✗ TEXT LAYER MISALIGNED");
  console.log(
    lengthsAgree ? "✓ offsets agree with text" : "✗ offsets disagree with text"
  );

  await db.$disconnect();
})();
