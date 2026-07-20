import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireCircleMember, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

const schema = z.object({
  circleId: z.string().min(1),
  milestoneId: z.string().nullish(),
  body: z.string().trim().min(1, "Say something").max(4000),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const input = await parseBody(req, schema);
    await requireCircleMember(user.id, input.circleId);

    if (input.milestoneId) {
      const milestone = await db.milestone.findUnique({
        where: { id: input.milestoneId },
        include: { document: true },
      });
      if (!milestone || milestone.document.circleId !== input.circleId) {
        throw new AuthError("That room doesn't exist", 404);
      }

      // Enforce the spoiler gate server-side too. The UI hides locked rooms,
      // but a hidden button is not a rule.
      const progress = await db.readingProgress.findUnique({
        where: {
          userId_documentId: { userId: user.id, documentId: milestone.documentId },
        },
      });
      if ((progress?.currentPage ?? 1) < milestone.endPage) {
        throw new AuthError(
          `Finish through page ${milestone.endPage} to join this room`,
          403
        );
      }
    }

    await db.chatMessage.create({
      data: {
        circleId: input.circleId,
        userId: user.id,
        milestoneId: input.milestoneId ?? null,
        body: input.body,
      },
    });

    publish(input.circleId, {
      type: "chat:created",
      circleId: input.circleId,
      milestoneId: input.milestoneId ?? null,
    });

    return { ok: true };
  });
}
