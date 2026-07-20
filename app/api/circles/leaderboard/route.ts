import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { requireCircleAdmin } from "@/lib/circle-governance";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

/**
 * Admin tunes (or switches off) the circle's leaderboard.
 *
 * Weights are capped at 10 and floored at 0 so the ranking stays a readable
 * blend rather than a single metric wearing three hats — and 0 on every
 * weight is legal, which is just a quieter way of turning it off.
 */
const schema = z.object({
  circleId: z.string().min(1),
  lbEnabled: z.boolean(),
  lbWeightPages: z.number().int().min(0).max(10),
  lbWeightHighlights: z.number().int().min(0).max(10),
  lbWeightDiscussion: z.number().int().min(0).max(10),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const admin = await requireUserApi();
    const body = await parseBody(req, schema);
    await requireCircleAdmin(admin.id, body.circleId);

    await db.circle.update({
      where: { id: body.circleId },
      data: {
        lbEnabled: body.lbEnabled,
        lbWeightPages: body.lbWeightPages,
        lbWeightHighlights: body.lbWeightHighlights,
        lbWeightDiscussion: body.lbWeightDiscussion,
      },
    });

    publish(body.circleId, { type: "circle:updated", circleId: body.circleId });
    return { ok: true };
  });
}
