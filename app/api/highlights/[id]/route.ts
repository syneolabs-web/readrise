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

    const highlight = await db.highlight.findUnique({ where: { id } });
    if (!highlight) throw new AuthError("Highlight not found", 404);

    const document = await requireDocumentAccess(user.id, highlight.documentId);
    await requireAuthorOrOwner(user.id, document.circleId, highlight.userId);

    // Comments and vault entries cascade via the schema.
    await db.highlight.delete({ where: { id } });

    publish(document.circleId, {
      type: "highlight:deleted",
      documentId: document.id,
      highlightId: id,
    });

    return { ok: true };
  });
}
