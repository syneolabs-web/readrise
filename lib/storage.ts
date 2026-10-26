import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Storage for uploaded PDFs. Two backends behind one interface:
 *
 *   - Supabase Storage, when SUPABASE_SECRET_KEY is set (production). Files go
 *     to a PRIVATE bucket; the secret key bypasses RLS server-side, which is
 *     exactly right because our own auth already gated the request.
 *   - Local disk under STORAGE_DIR otherwise (dev, offline).
 *
 * Either way, file bytes are reachable ONLY through
 * /api/documents/[id]/file, which checks circle membership first. A PDF in a
 * private circle must never be a guessable URL — that's why the bucket is
 * private and why nothing here lives under public/.
 *
 * The secret key is server-only. It must never be prefixed NEXT_PUBLIC_.
 */

const STORAGE_DIR = process.env.STORAGE_DIR || "./storage";
const BUCKET = "documents";
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const useSupabase = Boolean(SUPABASE_URL && SECRET_KEY);

/**
 * Fail loudly when production is configured to write to a disk that cannot be
 * written to.
 *
 * This exact misconfiguration already shipped once: SUPABASE_SECRET_KEY was
 * set in Vercel but NEXT_PUBLIC_SUPABASE_URL was not, so `useSupabase` was
 * false and every upload fell through to writeFile() on a read-only
 * filesystem. The user-visible result was a generic "Something went wrong",
 * which points at the upload route rather than at the missing variable, so
 * the real cause was invisible from the outside.
 *
 * Setting one of the two and not the other is always a mistake, so it is
 * worth naming precisely — the whole cost of that outage was not knowing
 * which variable was missing.
 */
function assertStorageConfigured(): void {
  if (useSupabase || process.env.NODE_ENV !== "production") return;

  const missing = [
    !SUPABASE_URL && "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)",
    !SECRET_KEY && "SUPABASE_SECRET_KEY",
  ].filter(Boolean);

  throw new Error(
    `Storage is not configured: ${missing.join(" and ")} missing. ` +
      "Production cannot use the local-disk fallback — the filesystem is " +
      "ephemeral and read-only, so uploads would be lost even if they " +
      "appeared to succeed. Set the variable(s) in your host's environment " +
      "and redeploy."
  );
}

// ── Supabase backend ────────────────────────────────────────

let adminClient: SupabaseClient | null = null;
let bucketReady = false;

function admin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL!, SECRET_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

/** Create the private bucket on first use, so setup needs no manual step. */
async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  const { data } = await admin().storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await admin().storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_UPLOAD_BYTES,
      allowedMimeTypes: ["application/pdf"],
    });
    // A racing instance may have created it between our check and create.
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  bucketReady = true;
}

// ── Local-disk backend ──────────────────────────────────────

function resolveKey(key: string): string {
  const root = path.resolve(STORAGE_DIR);
  const full = path.resolve(root, key);
  // Defense in depth: storageKey is generated, never user-supplied, but a
  // future caller might not know that.
  if (!full.startsWith(root + path.sep) && full !== root) {
    throw new Error("Invalid storage key");
  }
  return full;
}

// ── The interface the app sees ──────────────────────────────

/** True when uploads can bypass the server and go straight to Supabase. */
export const canUploadDirect = useSupabase;

export function newStorageKey(ext = "pdf"): string {
  return `${Date.now()}-${randomBytes(12).toString("hex")}.${ext}`;
}

/**
 * Mint a one-shot URL the browser can PUT the file to directly.
 *
 * This exists because Vercel caps a serverless function's request body at
 * 4.5MB and that limit is not configurable. Routing a book through
 * /api/documents therefore fails with FUNCTION_PAYLOAD_TOO_LARGE for any
 * realistic PDF — the 50MB cap below was never reachable in production. The
 * bytes have to skip the function entirely.
 */
export async function createDirectUpload(
  key: string
): Promise<{ signedUrl: string; token: string }> {
  assertStorageConfigured();
  await ensureBucket();
  const { data, error } = await admin()
    .storage.from(BUCKET)
    .createSignedUploadUrl(key);
  if (error || !data) {
    throw new Error(`Could not start upload: ${error?.message ?? "no data"}`);
  }
  return { signedUrl: data.signedUrl, token: data.token };
}

/**
 * Confirm an object really landed, and how big it is.
 *
 * With direct upload the server never sees the bytes, so this is the only
 * point where we can refuse an upload that silently failed or that lied about
 * its size. Returns null when the object isn't there.
 */
export async function statStoredFile(
  key: string
): Promise<{ size: number } | null> {
  assertStorageConfigured();
  const { data, error } = await admin()
    .storage.from(BUCKET)
    .list("", { search: key, limit: 1 });
  if (error || !data?.length) return null;
  const found = data.find((f) => f.name === key);
  const size = (found?.metadata as { size?: number } | undefined)?.size;
  return found ? { size: typeof size === "number" ? size : 0 } : null;
}

export async function saveFile(buffer: Buffer, ext = "pdf"): Promise<string> {
  assertStorageConfigured();
  const key = newStorageKey(ext);

  if (useSupabase) {
    await ensureBucket();
    const { error } = await admin()
      .storage.from(BUCKET)
      .upload(key, buffer, { contentType: "application/pdf" });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return key;
  }

  const full = resolveKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, buffer);
  return key;
}

export async function readStoredFile(key: string): Promise<Buffer> {
  assertStorageConfigured();
  if (useSupabase) {
    const { data, error } = await admin().storage.from(BUCKET).download(key);
    if (error || !data) {
      throw new Error(`Download failed: ${error?.message ?? "no data"}`);
    }
    return Buffer.from(await data.arrayBuffer());
  }

  return readFile(resolveKey(key));
}

export async function deleteStoredFile(key: string): Promise<void> {
  if (useSupabase) {
    await admin().storage.from(BUCKET).remove([key]);
    return;
  }

  await unlink(resolveKey(key)).catch(() => {
    // Already gone is a fine outcome for a delete.
  });
}

/** PDFs start with "%PDF-". Trusting the browser's Content-Type is not a check. */
export function isPdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString("latin1") === "%PDF-";
}

export function checksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}
