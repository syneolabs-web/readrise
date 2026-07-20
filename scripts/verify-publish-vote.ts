import { PrismaClient } from "@prisma/client";
import { resolveProposalIfDecided } from "../lib/circle-governance";

/**
 * Prove the publish vote's two load-bearing rules, against the real DB:
 *
 *   1. A single "no" rejects the motion even with full turnout.
 *   2. Only a unanimous yes flips the circle to public.
 *
 * Run: npx tsx scripts/verify-publish-vote.ts
 */
const db = new PrismaClient();

async function main() {
  const circle = await db.circle.findFirst({
    where: { slug: "growth-mindset" },
    include: { memberships: true },
  });
  if (!circle) throw new Error("seed circle missing");

  const [a, b, c] = circle.memberships;
  if (!a || !b || !c) throw new Error("expected 3 members");

  // clean slate
  await db.publishProposal.deleteMany({ where: { circleId: circle.id } });
  await db.circle.update({
    where: { id: circle.id },
    data: { isPublic: false, publishedAt: null },
  });

  // ── Case 1: full turnout, one dissenter → rejected ────────
  const p1 = await db.publishProposal.create({
    data: {
      circleId: circle.id,
      proposedById: a.userId,
      votes: {
        create: [
          { userId: a.userId, approve: true },
          { userId: b.userId, approve: true },
          { userId: c.userId, approve: false }, // the lone objection
        ],
      },
    },
  });
  const r1 = await resolveProposalIfDecided(p1.id);
  const c1 = await db.circle.findUnique({ where: { id: circle.id } });
  console.log(
    `case 1 (3/3 voted, one no): status=${r1?.status} isPublic=${c1?.isPublic}`
  );
  const pass1 = r1?.status === "rejected" && c1?.isPublic === false;
  console.log(pass1 ? "  ✓ dissent blocks it" : "  ✗ FAILED");

  // ── Case 2: unanimous yes → published ─────────────────────
  const p2 = await db.publishProposal.create({
    data: {
      circleId: circle.id,
      proposedById: a.userId,
      votes: {
        create: [
          { userId: a.userId, approve: true },
          { userId: b.userId, approve: true },
        ],
      },
    },
  });
  const mid = await resolveProposalIfDecided(p2.id);
  const cMid = await db.circle.findUnique({ where: { id: circle.id } });
  console.log(
    `case 2a (2/3 yes, one silent): status=${mid?.status} isPublic=${cMid?.isPublic}`
  );
  const pass2a = mid?.status === "open" && cMid?.isPublic === false;
  console.log(pass2a ? "  ✓ silence is not consent" : "  ✗ FAILED");

  await db.publishVote.create({
    data: { proposalId: p2.id, userId: c.userId, approve: true },
  });
  const r2 = await resolveProposalIfDecided(p2.id);
  const c2 = await db.circle.findUnique({ where: { id: circle.id } });
  console.log(
    `case 2b (3/3 yes): status=${r2?.status} isPublic=${c2?.isPublic} publishedAt=${c2?.publishedAt ? "set" : "null"}`
  );
  const pass2b = r2?.status === "passed" && c2?.isPublic === true && !!c2?.publishedAt;
  console.log(pass2b ? "  ✓ unanimity publishes" : "  ✗ FAILED");

  console.log(
    pass1 && pass2a && pass2b ? "\nALL PASS" : "\nSOME CHECKS FAILED"
  );
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
