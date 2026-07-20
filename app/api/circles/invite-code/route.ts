import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { requireCircleAdmin } from "@/lib/circle-governance";
import { db } from "@/lib/db";
import { generateInviteCode } from "@/lib/utils";
import { publish } from "@/lib/events";

/**
 * Rotate the circle's invite code. Owner only.
 *
 * Rotation is the whole point of the feature: a code that has leaked into a
 * group chat can be retired without disbanding the circle. Existing members
 * are unaffected — only the door key changes.
 *
 * `inviteCode` is @unique, so a collision is a real (if unlikely) outcome;
 * retry a few times rather than throwing a 500 at the user.
 */
const schema = z.object({ circleId: z.string().min(1) });

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const { circleId } = await parseBody(req, schema);
    await requireCircleAdmin(user.id, circleId);

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateInviteCode();
      const taken = await db.circle.findUnique({ where: { inviteCode: code } });
      if (taken) continue;

      const circle = await db.circle.update({
        where: { id: circleId },
        data: { inviteCode: code },
      });
      publish(circleId, { type: "circle:updated", circleId });
      return { inviteCode: circle.inviteCode };
    }

    throw new Error("Couldn't generate a fresh code — try again");
  });
}
