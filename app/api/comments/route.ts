import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireDocumentAccess, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

const schema = z.object({
  highlightId: z.string().min(1),
  body: z.string().trim().min(1, "Say something").max(4000),
  parentId: z.string().nullish(),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const input = await parseBody(req, schema);

    const highlight = await db.highlight.findUnique({
      where: { id: input.highlightId },
    });
    if (!highlight) throw new AuthError("Highlight not found", 404);

    const document = await requireDocumentAccess(user.id, highlight.documentId);

    // A reply must belong to the same thread, or the tree can be corrupted
    // by pointing parentId at a comment on someone else's highlight.
    if (input.parentId) {
      const parent = await db.comment.findUnique({ where: { id: input.parentId } });
      if (!parent || parent.highlightId !== highlight.id) {
        throw new AuthError("That reply target doesn't exist", 400);
      }
    }

    const comment = await db.comment.create({
      data: {
        highlightId: highlight.id,
        userId: user.id,
        body: input.body,
        parentId: input.parentId ?? null,
      },
    });

    publish(document.circleId, {
      type: "comment:created",
      highlightId: highlight.id,
      documentId: document.id,
    });

    return { id: comment.id };
  });
}
