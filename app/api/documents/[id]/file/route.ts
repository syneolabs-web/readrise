import { requireDocumentAccess, requireUserApi, AuthError } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * The ONLY way to read an uploaded PDF's bytes.
 *
 * Uploads live outside public/ precisely so this membership check can't be
 * bypassed by guessing a static URL. See docs/BLUEPRINT.md §6.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUserApi();
    const document = await requireDocumentAccess(user.id, id);

    const buffer = await readStoredFile(document.storageKey);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(buffer.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(document.title)}.pdf"`,
        // Private: this must never land in a shared/CDN cache.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(err.message, { status: err.status });
    }
    console.error("[documents/file]", err);
    return new Response("Something went wrong", { status: 500 });
  }
}
