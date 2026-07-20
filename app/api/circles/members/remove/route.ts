import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireUserApi } from "@/lib/auth";
import { requireCircleAdmin } from "@/lib/circle-governance";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

/**
 * Admin removes a member for abuse or toxic behaviour.
 *
 * The removal is logged with a reason and that log row doubles as the ban —
 * see ModerationAction in the schema. Deleting the Membership alone would let
 * them rejoin a public circle instantly.
 *
 * A reason is REQUIRED. Moderation without a recorded justification is how
 * small communities turn arbitrary, and the admin is a peer here, not staff.
 */
const schema = z.object({
  circleId: z.string().min(1),
  userId: z.string().min(1),
  reason: z.string().trim().min(4, "Give a reason for the removal").max(500),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const admin = await requireUserApi();
    const { circleId, userId, reason } = await parseBody(req, schema);
    await requireCircleAdmin(admin.id, circleId);

    if (userId === admin.id) {
      throw new AuthError("You can't remove yourself — transfer the circle instead", 400);
    }

    const target = await db.membership.findUnique({
      where: { userId_circleId: { userId, circleId } },
    });
    if (!target) throw new AuthError("That person isn't in this circle", 404);
    if (target.role === "owner") {
      throw new AuthError("The circle owner can't be removed", 403);
    }

    // Log first: if the delete fails we'd rather have an unused ban row than
    // an unexplained removal.
    await db.moderationAction.create({
      data: { circleId, actorId: admin.id, targetId: userId, action: "remove", reason },
    });
    await db.membership.delete({ where: { id: target.id } });

    publish(circleId, { type: "circle:updated", circleId });
    return { ok: true };
  });
}
