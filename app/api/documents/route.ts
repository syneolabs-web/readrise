import { apiHandler } from "@/lib/api";
import { AuthError, requireCircleMember, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  deleteStoredFile,
  isPdf,
  MAX_UPLOAD_BYTES,
  saveFile,
  statStoredFile,
} from "@/lib/storage";
import { verifyUploadKey } from "@/lib/upload-token";

export const runtime = "nodejs";

/** Metadata shared by both upload paths. */
type Meta = {
  circleId: string;
  title: string;
  author: string;
  pageCount: number;
  goalDays: number | null;
  goalRitual: string | null;
};

function readMeta(get: (k: string) => unknown): Meta {
  const str = (k: string) => String(get(k) ?? "").trim();

  // Reading goal. Absent/blank/garbage all mean "no goal" — a first-class
  // choice, so it fails open rather than erroring the upload.
  const rawDays = Number(get("goalDays") ?? "");
  const goalDays =
    Number.isFinite(rawDays) && rawDays >= 1
      ? Math.min(365, Math.trunc(rawDays))
      : null;

  // Computed client-side by pdf.js at pick time. Cosmetic only (progress
  // denominator), never a security boundary, so clamping is enough.
  const rawPages = Number(get("pageCount") ?? 0);

  return {
    circleId: str("circleId"),
    title: str("title"),
    author: str("author"),
    pageCount: Number.isFinite(rawPages)
      ? Math.max(0, Math.min(10_000, Math.trunc(rawPages)))
      : 0,
    goalDays,
    goalRitual: goalDays ? str("goalRitual").slice(0, 200) || null : null,
  };
}

async function createDocument(meta: Meta, storageKey: string, userId: string) {
  const document = await db.document.create({
    data: {
      circleId: meta.circleId,
      title: meta.title,
      author: meta.author || null,
      storageKey,
      pageCount: meta.pageCount,
      uploadedById: userId,
      goalDays: meta.goalDays,
      // The clock starts at upload, not at first open: a book sitting
      // unopened for a week is exactly the state the goal exists to surface.
      goalStartedAt: meta.goalDays ? new Date() : null,
      goalRitual: meta.goalRitual,
    },
  });
  return { id: document.id };
}

/**
 * Two ways in, because the platform forces it.
 *
 * JSON  — "finalize": the browser already PUT the file straight to Supabase
 *         Storage and is telling us which object to attach. This is the
 *         production path, and the only one that works for a book-sized PDF:
 *         Vercel rejects any function request body over 4.5MB with
 *         FUNCTION_PAYLOAD_TOO_LARGE before our code ever runs.
 *
 * multipart — the original path, still used in local development where there
 *         is no Supabase project and storage is just a directory.
 */
export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const contentType = req.headers.get("content-type") ?? "";

    // ── Finalize a direct upload ──────────────────────────────
    if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const meta = readMeta((k) => body[k]);
      const storageKey = String(body.key ?? "");
      const keyToken = String(body.keyToken ?? "");

      if (!meta.title) throw new AuthError("Give the book a title", 400);
      await requireCircleMember(user.id, meta.circleId);

      // The client chose this key, so it has to prove we issued it — to this
      // user, for this circle. Otherwise a member could attach another
      // circle's private PDF to their own. See lib/upload-token.ts.
      if (!verifyUploadKey(keyToken, storageKey, user.id, meta.circleId)) {
        throw new AuthError("Upload token is invalid or expired", 403);
      }

      // The bytes never passed through us, so this is the only place we can
      // catch an upload that silently failed or overran the cap.
      const stat = await statStoredFile(storageKey);
      if (!stat) throw new AuthError("Upload didn't complete — try again", 400);
      if (stat.size > MAX_UPLOAD_BYTES) {
        await deleteStoredFile(storageKey);
        throw new AuthError("That file is over the 50MB limit", 413);
      }

      return createDocument(meta, storageKey, user.id);
    }

    // ── Local development: bytes through the server ───────────
    const form = await req.formData();
    const file = form.get("file");
    const meta = readMeta((k) => form.get(k));

    if (!(file instanceof File)) throw new AuthError("No file provided", 400);
    if (!meta.title) throw new AuthError("Give the book a title", 400);

    await requireCircleMember(user.id, meta.circleId);

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new AuthError("That file is over the 50MB limit", 413);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Content-Type comes from the browser and is trivially spoofed; the magic
    // bytes are the actual check.
    if (!isPdf(buffer)) throw new AuthError("That file isn't a PDF", 415);

    const storageKey = await saveFile(buffer, "pdf");
    return createDocument(meta, storageKey, user.id);
  });
}
