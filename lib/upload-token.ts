import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signs the storage key handed to the browser for a direct upload.
 *
 * Direct-to-storage upload means the client, not the server, tells us which
 * object to attach to the new Document row. Left unchecked that is a real
 * hole: any member could finalise an upload naming *another circle's* storage
 * key and mount someone else's private PDF inside a circle they control.
 *
 * So the key is only ever minted server-side and comes back with an HMAC over
 * (key, userId, circleId, expiry). Verification re-derives the MAC from the
 * request's own session and circle, which means a token is useless to anyone
 * but the user it was issued to, for the circle it was issued for.
 *
 * SESSION_SECRET is reused deliberately — it already gates session forgery,
 * so a second secret would add key management without adding safety.
 */

const TTL_MS = 30 * 60 * 1000; // generous: a 50MB upload on hotel wifi is slow

function secret(): Buffer {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set");
  return Buffer.from(s);
}

function mac(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

const payloadOf = (key: string, userId: string, circleId: string, exp: number) =>
  [key, userId, circleId, exp].join("|");

export function signUploadKey(
  key: string,
  userId: string,
  circleId: string
): string {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${mac(payloadOf(key, userId, circleId, exp))}`;
}

export function verifyUploadKey(
  token: string,
  key: string,
  userId: string,
  circleId: string
): boolean {
  const [expRaw, given] = token.split(".");
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp || !given) return false;

  const expected = mac(payloadOf(key, userId, circleId, exp));
  // Both are hex of the same length, so the compare is safe to do in constant
  // time without a length check leaking anything.
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
