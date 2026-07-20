import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireCircleMember, requireUserApi } from "@/lib/auth";
import { getOpenProposal, resolveProposalIfDecided } from "@/lib/circle-governance";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

/**
 * Cast (or change) your vote on an open publish proposal.
 *
 * A vote is changeable while the proposal is open — someone who voted yes
 * before reading the thread should be able to take it back. It's the
 * resolution check that decides when the motion is settled.
 */
const schema = z.object({
  proposalId: z.string().min(1),
  approve: z.boolean(),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const { proposalId, approve } = await parseBody(req, schema);

    const proposal = await db.publishProposal.findUnique({
      where: { id: proposalId },
    });
    if (!proposal) throw new AuthError("Vote not found", 404);
    if (proposal.status !== "open") throw new AuthError("This vote has closed", 409);

    await requireCircleMember(user.id, proposal.circleId);

    await db.publishVote.upsert({
      where: { proposalId_userId: { proposalId, userId: user.id } },
      update: { approve, votedAt: new Date() },
      create: { proposalId, userId: user.id, approve },
    });

    const resolved = await resolveProposalIfDecided(proposalId);
    publish(proposal.circleId, { type: "circle:updated", circleId: proposal.circleId });

    return {
      status: resolved?.status ?? "open",
      state: await getOpenProposal(proposal.circleId),
    };
  });
}
