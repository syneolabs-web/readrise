import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { requireDocumentAccess, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

const schema = z.object({
  documentId: z.string().min(1),
  currentPage: z.number().int().positive(),
});

/**
 * Powers Progress Match and unlocks milestone rooms.
 *
 * Self-reported by design: this is a courtesy rail among friends, not an
 * adversarial control. Someone determined to spoil themselves can just say
 * they're on page 200 — and that's their business.
 */
export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const { documentId, currentPage } = await parseBody(req, schema);
    const document = await requireDocumentAccess(user.id, documentId);

    const requested = document.pageCount
      ? Math.min(currentPage, document.pageCount)
      : currentPage;

    // Furthest-page-reached, not last-page-viewed. Progress must be monotonic:
    // flipping back to re-read chapter 1 should never re-lock a milestone room
    // you already earned.
    const existing = await db.readingProgress.findUnique({
      where: { userId_documentId: { userId: user.id, documentId } },
    });
    const page = Math.max(requested, existing?.currentPage ?? 0);

    if (existing?.currentPage === page) return { ok: true, page };

    await db.readingProgress.upsert({
      where: { userId_documentId: { userId: user.id, documentId } },
      update: { currentPage: page },
      create: { userId: user.id, documentId, currentPage: page },
    });

    publish(document.circleId, {
      type: "progress:updated",
      documentId,
      userId: user.id,
      page,
    });

    return { ok: true, page };
  });
}
