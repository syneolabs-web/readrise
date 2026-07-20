import { apiHandler } from "@/lib/api";
import { AuthError, requireCircleMember, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

/** Toggle your own check-in. You cannot check in on someone else's behalf. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const user = await requireUserApi();

    const action = await db.microAction.findUnique({ where: { id } });
    if (!action) throw new AuthError("Action not found", 404);
    await requireCircleMember(user.id, action.circleId);

    const existing = await db.actionCheckin.findUnique({
      where: { microActionId_userId: { microActionId: id, userId: user.id } },
    });

    if (existing) {
      await db.actionCheckin.delete({ where: { id: existing.id } });
    } else {
      await db.actionCheckin.create({
        data: { microActionId: id, userId: user.id, done: true },
      });
    }

    publish(action.circleId, { type: "action:updated", circleId: action.circleId });

    return { done: !existing };
  });
}
