import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireCircleMember, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

const schema = z
  .object({
    circleId: z.string().min(1),
    highlightId: z.string().nullish(),
    microActionId: z.string().nullish(),
    note: z.string().trim().max(1000).nullish(),
  })
  .refine((v) => Boolean(v.highlightId) !== Boolean(v.microActionId), {
    message: "Pin exactly one of a highlight or an action",
  });

/** Insight Vault: the circle's second brain, indexed across every book. */
export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const input = await parseBody(req, schema);
    await requireCircleMember(user.id, input.circleId);

    // Verify the pinned thing actually belongs to this circle — otherwise a
    // member of circle A could pin circle B's highlight into their vault.
    if (input.highlightId) {
      const highlight = await db.highlight.findUnique({
        where: { id: input.highlightId },
        include: { document: true },
      });
      if (!highlight || highlight.document.circleId !== input.circleId) {
        throw new AuthError("Highlight not found", 404);
      }
      const dupe = await db.vaultEntry.findFirst({
        where: { circleId: input.circleId, highlightId: input.highlightId },
      });
      if (dupe) return { id: dupe.id, alreadyPinned: true };
    }

    if (input.microActionId) {
      const action = await db.microAction.findUnique({
        where: { id: input.microActionId },
      });
      if (!action || action.circleId !== input.circleId) {
        throw new AuthError("Action not found", 404);
      }
      const dupe = await db.vaultEntry.findFirst({
        where: { circleId: input.circleId, microActionId: input.microActionId },
      });
      if (dupe) return { id: dupe.id, alreadyPinned: true };
    }

    const entry = await db.vaultEntry.create({
      data: {
        circleId: input.circleId,
        addedById: user.id,
        highlightId: input.highlightId ?? null,
        microActionId: input.microActionId ?? null,
        note: input.note || null,
      },
    });

    publish(input.circleId, { type: "vault:updated", circleId: input.circleId });

    return { id: entry.id };
  });
}
