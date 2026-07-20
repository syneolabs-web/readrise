import { apiHandler } from "@/lib/api";
import { AuthError, requireDocumentAccess, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

/** Toggle. The unique index on (commentId, userId) is what makes it idempotent. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const user = await requireUserApi();

    const comment = await db.comment.findUnique({
      where: { id },
      include: { highlight: true },
    });
    if (!comment) throw new AuthError("Comment not found", 404);

    const document = await requireDocumentAccess(user.id, comment.highlight.documentId);

    const existing = await db.commentVote.findUnique({
      where: { commentId_userId: { commentId: id, userId: user.id } },
    });

    if (existing) {
      await db.commentVote.delete({ where: { id: existing.id } });
    } else {
      await db.commentVote.create({ data: { commentId: id, userId: user.id } });
    }

    publish(document.circleId, {
      type: "comment:created",
      highlightId: comment.highlightId,
      documentId: document.id,
    });

    return { voted: !existing };
  });
}
