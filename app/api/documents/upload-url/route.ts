import { apiHandler, parseBody } from "@/lib/api";
import { requireCircleMember, requireUserApi } from "@/lib/auth";
import { canUploadDirect, createDirectUpload, newStorageKey } from "@/lib/storage";
import { signUploadKey } from "@/lib/upload-token";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({ circleId: z.string().min(1) });

/**
 * Step one of an upload: ask where to put the file.
 *
 * Returns `mode: "direct"` when Supabase Storage is configured — the browser
 * then PUTs the bytes straight to Supabase, which is the only way to exceed
 * Vercel's non-negotiable 4.5MB function body limit.
 *
 * Falls back to `mode: "multipart"` for local development, where storage is a
 * directory on disk and there is nothing to sign a URL against. Keeping both
 * paths means dev works offline without a Supabase project, and the size
 * ceiling that bites in production simply doesn't exist locally.
 *
 * Membership is checked HERE, before any URL is minted, so a signed upload URL
 * is never handed to someone who couldn't post to the circle anyway.
 */
export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const { circleId } = await parseBody(req, Body);
    await requireCircleMember(user.id, circleId);

    if (!canUploadDirect) return { mode: "multipart" as const };

    const key = newStorageKey("pdf");
    const { signedUrl, token } = await createDirectUpload(key);

    return {
      mode: "direct" as const,
      key,
      signedUrl,
      token,
      // Proves to the finalize step that WE issued this key, for this user and
      // this circle. Without it the client could name any object in the bucket.
      keyToken: signUploadKey(key, user.id, circleId),
    };
  });
}
