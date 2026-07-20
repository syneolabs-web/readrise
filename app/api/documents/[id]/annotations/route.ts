import { apiHandler } from "@/lib/api";
import { requireDocumentAccess, requireUserApi } from "@/lib/auth";
import { getHighlights } from "@/lib/serialize";

/**
 * Refetch target for the SSE client. The stream carries only "something
 * changed" signals, not payloads — so authorization is re-checked here on
 * every read, and there's exactly one code path that decides what a user
 * is allowed to see.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const user = await requireUserApi();
    await requireDocumentAccess(user.id, id);
    return { highlights: await getHighlights(id, user.id) };
  });
}
