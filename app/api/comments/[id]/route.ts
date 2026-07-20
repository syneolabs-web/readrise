import { apiHandler } from "@/lib/api";
import {
  AuthError,
  requireAuthorOrOwner,
  requireDocumentAccess,
  requireUserApi,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

export async function DELETE(
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
    await requireAuthorOrOwner(user.id, document.circleId, comment.userId);

    await db.comment.delete({ where: { id } });

    publish(document.circleId, {
      type: "comment:deleted",
      highlightId: comment.highlightId,
      documentId: document.id,
    });

    return { ok: true };
  });
}
