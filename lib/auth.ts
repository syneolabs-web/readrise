import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import { getSessionUserId } from "./session";
import type { MemberRole } from "./types";

/**
 * Authorization. There is exactly ONE gate in this app: does a Membership row
 * exist linking this user to this circle? Because circles are small and
 * trusted, the circle IS the permission boundary — no per-annotation ACLs.
 * See docs/BLUEPRINT.md §6.
 *
 * Thrown AuthError is translated to an HTTP status by apiHandler (lib/api.ts).
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  avatarImage: string | null;
};

export const getCurrentUser = cache(async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatarColor: true, avatarImage: true },
  });
});

/** For pages: bounce to login. Deduplicated across request lifecycle via React.cache. */
export const requireUser = cache(async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

/** For API routes: throw instead of redirecting. */
export async function requireUserApi(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Not signed in", 401);
  return user;
}

/**
 * The gate. Everything circle-scoped passes through here.
 * 404 rather than 403 on non-membership: a private circle shouldn't confirm
 * its own existence to a non-member.
 */
export async function requireCircleMember(
  userId: string,
  circleId: string,
  role?: MemberRole
) {
  const membership = await db.membership.findUnique({
    where: { userId_circleId: { userId, circleId } },
  });
  if (!membership) throw new AuthError("Circle not found", 404);
  if (role === "owner" && membership.role !== "owner") {
    throw new AuthError("Only the circle owner can do that", 403);
  }
  return membership;
}

/** Resolve a document and prove membership of its circle in one step. */
export async function requireDocumentAccess(userId: string, documentId: string) {
  const document = await db.document.findUnique({ where: { id: documentId } });
  if (!document) throw new AuthError("Document not found", 404);
  await requireCircleMember(userId, document.circleId);
  return document;
}

/** Authors may delete their own content; circle owners may delete anything. */
export async function requireAuthorOrOwner(
  userId: string,
  circleId: string,
  authorId: string
) {
  if (userId === authorId) return;
  const membership = await requireCircleMember(userId, circleId);
  if (membership.role !== "owner") {
    throw new AuthError("You can only delete your own content", 403);
  }
}
