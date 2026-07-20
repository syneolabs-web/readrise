import { db } from "./db";
import { AuthError, requireCircleMember } from "./auth";

/**
 * Governance for public circles: the publish vote, admin powers, and ranking.
 *
 * Two rules hold this together and everything else follows from them:
 *
 * 1. THE ADMIN IS THE OWNER. Going public doesn't invent a new role — the
 *    member who created the circle keeps `role: "owner"` and simply gains
 *    moderation powers once `isPublic` is true. One concept, one check.
 *
 * 2. PUBLISHING NEEDS UNANIMITY, NOT JUST TURNOUT. Making a circle public
 *    retroactively exposes every highlight and thread the members wrote while
 *    it was private. A member who objects must be able to stop it alone, so a
 *    single "no" rejects the proposal immediately.
 */

/** Circle admin = the owner. Throws unless the viewer owns this circle. */
export async function requireCircleAdmin(userId: string, circleId: string) {
  const membership = await requireCircleMember(userId, circleId);
  if (membership.role !== "owner") {
    throw new AuthError("Only the circle admin can do that", 403);
  }
  return membership;
}

/** A removal row is a ban: it must block re-entry through the public door. */
export async function assertNotBanned(userId: string, circleId: string) {
  const ban = await db.moderationAction.findFirst({
    where: { circleId, targetId: userId, action: "remove" },
  });
  if (ban) {
    throw new AuthError("You were removed from this circle", 403);
  }
}

export type ProposalState = {
  id: string;
  status: string;
  proposedBy: { id: string; name: string };
  createdAt: Date;
  memberCount: number;
  votes: {
    userId: string;
    name: string;
    avatarColor: string;
    approve: boolean;
  }[];
  /** Members who haven't voted yet — the thing the UI actually nags about. */
  pending: { id: string; name: string; avatarColor: string }[];
};

export async function getOpenProposal(circleId: string): Promise<ProposalState | null> {
  const proposal = await db.publishProposal.findFirst({
    where: { circleId, status: "open" },
    include: {
      proposedBy: { select: { id: true, name: true } },
      votes: {
        include: { user: { select: { id: true, name: true, avatarColor: true } } },
      },
    },
  });
  if (!proposal) return null;

  const members = await db.membership.findMany({
    where: { circleId },
    include: { user: { select: { id: true, name: true, avatarColor: true } } },
  });
  const voted = new Set(proposal.votes.map((v) => v.userId));

  return {
    id: proposal.id,
    status: proposal.status,
    proposedBy: proposal.proposedBy,
    createdAt: proposal.createdAt,
    memberCount: members.length,
    votes: proposal.votes.map((v) => ({
      userId: v.userId,
      name: v.user.name,
      avatarColor: v.user.avatarColor,
      approve: v.approve,
    })),
    pending: members
      .filter((m) => !voted.has(m.userId))
      .map((m) => m.user),
  };
}

/**
 * Resolve a proposal if the vote is decided.
 *
 * Decided means: any "no" (reject immediately — see rule 2), or every current
 * member has voted "yes" (pass). Recomputed from live membership so a member
 * joining or leaving mid-vote can't strand a proposal in limbo.
 */
export async function resolveProposalIfDecided(proposalId: string) {
  const proposal = await db.publishProposal.findUnique({
    where: { id: proposalId },
    include: { votes: true },
  });
  if (!proposal || proposal.status !== "open") return proposal;

  const memberIds = (
    await db.membership.findMany({
      where: { circleId: proposal.circleId },
      select: { userId: true },
    })
  ).map((m) => m.userId);

  const rejected = proposal.votes.some((v) => !v.approve);
  const approvals = new Set(
    proposal.votes.filter((v) => v.approve).map((v) => v.userId)
  );
  const unanimous = memberIds.length > 0 && memberIds.every((id) => approvals.has(id));

  if (!rejected && !unanimous) return proposal;

  if (rejected) {
    return db.publishProposal.update({
      where: { id: proposalId },
      data: { status: "rejected", resolvedAt: new Date() },
    });
  }

  // Passed: publish the circle and stamp the moment it became public.
  await db.circle.update({
    where: { id: proposal.circleId },
    data: { isPublic: true, publishedAt: new Date() },
  });
  return db.publishProposal.update({
    where: { id: proposalId },
    data: { status: "passed", resolvedAt: new Date() },
  });
}

export type RankedMember = {
  userId: string;
  name: string;
  avatarColor: string;
  pages: number;
  highlights: number;
  discussion: number;
  score: number;
  rank: number;
  isAdmin: boolean;
};

/**
 * Rank members by the work they actually did in THIS circle.
 *
 * Three real signals — pages read, highlights made, discussion (thread
 * replies + lounge messages) — combined with admin-tunable weights. Nothing
 * here counts logins, streaks, or time-on-site: the leaderboard has to reward
 * reading, not presence, or it becomes the engagement bait the product
 * exists to replace.
 */
export async function getLeaderboard(circleId: string): Promise<RankedMember[]> {
  const circle = await db.circle.findUnique({
    where: { id: circleId },
    select: {
      lbWeightPages: true,
      lbWeightHighlights: true,
      lbWeightDiscussion: true,
      documents: { select: { id: true } },
    },
  });
  if (!circle) return [];

  const docIds = circle.documents.map((d) => d.id);
  const members = await db.membership.findMany({
    where: { circleId },
    include: { user: { select: { id: true, name: true, avatarColor: true } } },
  });

  const [progress, highlights, comments, messages] = await Promise.all([
    docIds.length
      ? db.readingProgress.findMany({
          where: { documentId: { in: docIds } },
          select: { userId: true, currentPage: true },
        })
      : [],
    docIds.length
      ? db.highlight.groupBy({
          by: ["userId"],
          where: { documentId: { in: docIds } },
          _count: { _all: true },
        })
      : [],
    docIds.length
      ? db.comment.groupBy({
          by: ["userId"],
          where: { highlight: { documentId: { in: docIds } } },
          _count: { _all: true },
        })
      : [],
    db.chatMessage.groupBy({
      by: ["userId"],
      where: { circleId },
      _count: { _all: true },
    }),
  ]);

  const pagesBy = new Map<string, number>();
  for (const p of progress) {
    // currentPage is furthest-page-reached per document; summing across the
    // circle's books is the honest "how much have you actually read" number.
    pagesBy.set(p.userId, (pagesBy.get(p.userId) ?? 0) + p.currentPage);
  }
  const hlBy = new Map(highlights.map((h) => [h.userId, h._count._all]));
  const cmBy = new Map(comments.map((c) => [c.userId, c._count._all]));
  const msgBy = new Map(messages.map((m) => [m.userId, m._count._all]));

  const rows = members.map((m) => {
    const pages = pagesBy.get(m.userId) ?? 0;
    const hl = hlBy.get(m.userId) ?? 0;
    const discussion = (cmBy.get(m.userId) ?? 0) + (msgBy.get(m.userId) ?? 0);
    return {
      userId: m.userId,
      name: m.user.name,
      avatarColor: m.user.avatarColor,
      pages,
      highlights: hl,
      discussion,
      score:
        pages * circle.lbWeightPages +
        hl * circle.lbWeightHighlights +
        discussion * circle.lbWeightDiscussion,
      isAdmin: m.role === "owner",
      rank: 0,
    };
  });

  rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  // Standard competition ranking: equal scores share a rank, next rank skips.
  let lastScore: number | null = null;
  let lastRank = 0;
  rows.forEach((r, i) => {
    if (r.score !== lastScore) {
      lastRank = i + 1;
      lastScore = r.score;
    }
    r.rank = lastRank;
  });
  return rows;
}

/**
 * A user's standing across every PUBLIC circle they belong to — the
 * "public activity status" shown on a profile.
 *
 * Only public circles contribute: activity inside someone's private circles
 * is nobody else's business, and leaking it through a profile badge would
 * break the privacy promise the whole product rests on.
 */
export async function getPublicStanding(userId: string) {
  const memberships = await db.membership.findMany({
    where: { userId, circle: { isPublic: true } },
    include: { circle: { select: { id: true, name: true, slug: true } } },
  });
  if (memberships.length === 0) {
    return { circles: 0, bestRank: null, totalScore: 0, tier: null, entries: [] };
  }

  const entries = [];
  let totalScore = 0;
  let bestRank: number | null = null;

  for (const m of memberships) {
    const board = await getLeaderboard(m.circleId);
    const mine = board.find((r) => r.userId === userId);
    if (!mine) continue;
    totalScore += mine.score;
    bestRank = bestRank === null ? mine.rank : Math.min(bestRank, mine.rank);
    entries.push({
      circleName: m.circle.name,
      circleSlug: m.circle.slug,
      rank: mine.rank,
      of: board.length,
      score: mine.score,
    });
  }

  // Tiers describe contribution, not status: they are thresholds on work done.
  const tier =
    totalScore >= 400
      ? "Pillar"
      : totalScore >= 150
        ? "Regular"
        : totalScore > 0
          ? "Active"
          : null;

  return { circles: entries.length, bestRank, totalScore, tier, entries };
}
