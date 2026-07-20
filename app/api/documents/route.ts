import { apiHandler } from "@/lib/api";
import { AuthError, requireCircleMember, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPdf, MAX_UPLOAD_BYTES, saveFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();

    const form = await req.formData();
    const file = form.get("file");
    const circleId = String(form.get("circleId") ?? "");
    const title = String(form.get("title") ?? "").trim();
    const author = String(form.get("author") ?? "").trim();
    // Computed client-side by pdf.js at pick time. Cosmetic only (progress
    // denominator), never a security boundary, so clamping is enough.
    const pageCount = Number(form.get("pageCount") ?? 0);

    // Reading goal. Absent/blank/garbage all mean "no goal" — a first-class
    // choice, so it fails open rather than erroring the upload.
    const rawDays = Number(form.get("goalDays") ?? "");
    const goalDays =
      Number.isFinite(rawDays) && rawDays >= 1
        ? Math.min(365, Math.trunc(rawDays))
        : null;
    const goalRitual =
      String(form.get("goalRitual") ?? "").trim().slice(0, 200) || null;

    if (!(file instanceof File)) throw new AuthError("No file provided", 400);
    if (!title) throw new AuthError("Give the book a title", 400);

    await requireCircleMember(user.id, circleId);

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new AuthError("That file is over the 50MB limit", 413);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Content-Type comes from the browser and is trivially spoofed; the magic
    // bytes are the actual check.
    if (!isPdf(buffer)) throw new AuthError("That file isn't a PDF", 415);

    const storageKey = await saveFile(buffer, "pdf");

    const document = await db.document.create({
      data: {
        circleId,
        title,
        author: author || null,
        storageKey,
        pageCount: Number.isFinite(pageCount)
          ? Math.max(0, Math.min(10_000, Math.trunc(pageCount)))
          : 0,
        uploadedById: user.id,
        goalDays,
        // The clock starts at upload, not at first open: a book sitting
        // unopened for a week is exactly the state the goal exists to surface.
        goalStartedAt: goalDays ? new Date() : null,
        goalRitual: goalDays ? goalRitual : null,
      },
    });

    return { id: document.id };
  });
}
