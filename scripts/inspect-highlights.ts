import { PrismaClient } from "@prisma/client";
import { parseRects } from "../lib/anchor";

/**
 * Dev utility: print the newest highlights and assert their rects are stored
 * as normalized 0..1 fractions rather than viewport pixels.
 *
 * Run: npx tsx scripts/inspect-highlights.ts
 */

const db = new PrismaClient();

(async () => {
  const rows = await db.highlight.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { user: { select: { name: true } } },
  });

  for (const row of rows) {
    const rects = parseRects(row.rects);
    const normalized = rects.every((r) =>
      [r.x, r.y, r.w, r.h].every((v) => v >= 0 && v <= 1)
    );
    console.log("---");
    console.log("by      :", row.user.name, "| page", row.pageNumber, "|", row.color);
    console.log("text    :", JSON.stringify(row.textContent.slice(0, 62)));
    console.log("offsets :", row.textStart, "->", row.textEnd);
    console.log("rects   :", JSON.stringify(rects));
    console.log("all 0..1:", normalized ? "YES (normalized)" : "NO — PIXELS LEAKED");
  }

  await db.$disconnect();
})();
