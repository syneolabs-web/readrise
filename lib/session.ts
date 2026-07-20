import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Session handling. Deliberately not NextAuth: this app has ~6 users who
 * know each other personally and no OAuth federation to solve. See
 * docs/BLUEPRINT.md §4.
 */

const COOKIE = "prodoxity_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  // A length check alone lets the committed development placeholder through —
  // it is comfortably over 32 characters and it is public in .env.example.
  // Anyone holding it can forge a session for any user, so refuse it in
  // production rather than deploying a silently authenticated-as-anyone app.
  if (process.env.NODE_ENV === "production" && /change-me|dev-only/i.test(s)) {
    throw new Error(
      "SESSION_SECRET is still the development placeholder. Generate a real " +
        'one: node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"'
    );
  }
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** Returns the userId, or null for anonymous / tampered / expired tokens. */
export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
