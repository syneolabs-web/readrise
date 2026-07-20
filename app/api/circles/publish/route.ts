import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireCircleMember, requireUserApi } from "@/lib/auth";
import { getOpenProposal, resolveProposalIfDecided } from "@/lib/circle-governance";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

/**
 * Open a motion to make this circle public.
 *
 * Any member may propose — going public is a circle decision, not an owner
 * decree — but only one proposal can be open at a time, and the proposer's
 * own "yes" is recorded immediately (you don't propose something you'd vote
 * against). See lib/circle-governance.ts for why unanimity is required.
 */
const schema = z.object({ circleId: z.string().min(1) });

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const { circleId } = await parseBody(req, schema);
    await requireCircleMember(user.id, circleId);

    const circle = await db.circle.findUnique({ where: { id: circleId } });
    if (!circle) throw new AuthError("Circle not found", 404);
    if (circle.isPublic) throw new AuthError("This circle is already public", 400);

    const open = await db.publishProposal.findFirst({
      where: { circleId, status: "open" },
    });
    if (open) throw new AuthError("A vote is already running", 409);

    const proposal = await db.publishProposal.create({
      data: {
        circleId,
        proposedById: user.id,
        votes: { create: { userId: user.id, approve: true } },
      },
    });

    // A one-member circle is unanimous the moment it's proposed.
    await resolveProposalIfDecided(proposal.id);
    publish(circleId, { type: "circle:updated", circleId });

    return { id: proposal.id, state: await getOpenProposal(circleId) };
  });
}
