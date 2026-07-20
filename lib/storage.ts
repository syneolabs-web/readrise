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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const useSupabase = Boolean(SUPABASE_URL && SECRET_KEY);

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

export async function saveFile(buffer: Buffer, ext = "pdf"): Promise<string> {
  const key = `${Date.now()}-${randomBytes(12).toString("hex")}.${ext}`;

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
