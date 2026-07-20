import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { requireCircleMember, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";
import { weekOf } from "@/lib/utils";

const schema = z.object({
  circleId: z.string().min(1),
  documentId: z.string().nullish(),
  milestoneId: z.string().nullish(),
  title: z.string().trim().min(3, "Be specific — what exactly will you do?").max(160),
  detail: z.string().trim().max(1000).nullish(),
});

/**
 * The COMMIT step. This is the endpoint that makes Prodoxity a different
 * product from every reading app in docs/BLUEPRINT.md §1.
 */
export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const input = await parseBody(req, schema);
    await requireCircleMember(user.id, input.circleId);

    const action = await db.microAction.create({
      data: {
        circleId: input.circleId,
        documentId: input.documentId ?? null,
        milestoneId: input.milestoneId ?? null,
        createdById: user.id,
        title: input.title,
        detail: input.detail || null,
        weekOf: weekOf(),
      },
    });

    // The proposer is in by default — you don't propose a habit you're not doing.
    await db.actionCheckin.create({
      data: { microActionId: action.id, userId: user.id, done: true },
    });

    publish(input.circleId, { type: "action:updated", circleId: input.circleId });

    return { id: action.id };
  });
}
