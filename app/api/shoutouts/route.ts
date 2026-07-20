import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireUserApi } from "@/lib/auth";
import { requireCircleAdmin } from "@/lib/circle-governance";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

/**
 * The admin gives a member a shoutout for a highlight worth the circle's
 * attention. Broadcast to everyone — the one piece of praise that isn't
 * buried in a thread.
 *
 * Deliberately admin-only and deliberately tied to a highlight: a shoutout
 * anyone could hand out becomes a like button, and the product doesn't have
 * one of those.
 */
const schema = z.object({
  circleId: z.string().min(1),
  highlightId: z.string().min(1),
  note: z.string().trim().max(300).nullish(),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const admin = await requireUserApi();
    const { circleId, highlightId, note } = await parseBody(req, schema);
    await requireCircleAdmin(admin.id, circleId);

    const highlight = await db.highlight.findUnique({
      where: { id: highlightId },
      include: { document: { select: { circleId: true } } },
    });
    if (!highlight || highlight.document.circleId !== circleId) {
      throw new AuthError("Highlight not found", 404);
    }

    const dupe = await db.shoutout.findFirst({ where: { circleId, highlightId } });
    if (dupe) return { id: dupe.id, already: true };

    const shoutout = await db.shoutout.create({
      data: {
        circleId,
        highlightId,
        fromId: admin.id,
        toId: highlight.userId,
        note: note || null,
      },
    });

    publish(circleId, { type: "circle:updated", circleId });
    return { id: shoutout.id };
  });
}
