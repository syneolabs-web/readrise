/**
 * Exercises the code paths a brand-new deployment hits on day one, against a
 * genuinely empty database.
 *
 * This matters because "empty" is not a corner case in production — it is the
 * first thing every real user sees, and it is the state least likely to have
 * been exercised in development, where the seed has always run. Aggregates
 * over no rows are where this breaks: `Math.max(...[])` is -Infinity, averages
 * divide by zero, and `findFirst` returns null into code expecting an object.
 *
 * Run against a scratch DB, never the real one:
 *   DATABASE_URL="file:./tmp.db" DIRECT_URL="file:./tmp.db" npx tsx scripts/verify-empty-db.ts
 */
import { db } from "../lib/db";
import { getCircleActivity, getMyProgress } from "../lib/activity";
import { getLeaderboard, getPublicStanding } from "../lib/circle-governance";
import { computeGoal } from "../lib/reading-goal";
import bcrypt from "bcryptjs";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!/tmp|scratch|empty/i.test(url)) {
    console.error(`Refusing to run against ${url} — point this at a scratch DB.`);
    process.exit(1);
  }

  const counts = await Promise.all([db.user.count(), db.circle.count()]);
  console.log(`Starting state: ${counts[0]} users, ${counts[1]} circles\n`);

  // 1. Signup — the very first write any deployment takes.
  const user = await db.user.create({
    data: {
      email: "first@example.com",
      name: "First User",
      passwordHash: await bcrypt.hash("a-real-password-123", 10),
    },
  });
  console.log("✓ signup writes cleanly");

  // 2. The dashboard's three panels, for someone in zero circles.
  const activity = await getCircleActivity(user.id);
  const progress = await getMyProgress(user.id);
  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    include: { circle: { include: { documents: true } } },
  });

  console.log(`✓ activity feed: ${activity.length} items (no crash on empty)`);
  console.log(
    `✓ progress: streak=${progress.streak} insights=${progress.insights} ` +
      `week=[${progress.week.map((d) => `${d.label}:${d.count}`).join(" ")}]`
  );

  // The bug class this is really hunting: a NaN or -Infinity reaching the DOM
  // as a bar width or a ring fraction.
  for (const [label, n] of [
    ["streak", progress.streak],
    ["insights", progress.insights],
    ["highlights", progress.highlights],
    ...progress.week.map((d) => [`week.${d.label}`, d.count] as [string, number]),
  ] as [string, number][]) {
    if (!Number.isFinite(n)) throw new Error(`${label} is not finite: ${n}`);
  }
  console.log("✓ every dashboard number is finite");

  // 3. Goals with nothing read yet.
  const goals = memberships
    .flatMap((m) => m.circle.documents)
    .map((d) => computeGoal({ ...d, currentPage: 1 }));
  console.log(`✓ goals: ${goals.length} (none expected)`);

  // 4. Discovery, for a user in nothing.
  const publicCircles = await db.circle.findMany({ where: { isPublic: true } });
  console.log(`✓ discover: ${publicCircles.length} public circles`);

  // 5. Standings on a circle with one member and zero activity — the state
  //    that used to render three zero-width bars with no explanation.
  const circle = await db.circle.create({
    data: {
      name: "First Circle",
      slug: "first-circle",
      inviteCode: "FIRST1",
      memberships: { create: { userId: user.id, role: "owner" } },
    },
  });
  const board = await getLeaderboard(circle.id);
  console.log(`✓ leaderboard: ${board.length} rows, scores=[${board.map((r) => r.score).join(",")}]`);
  for (const r of board) {
    if (!Number.isFinite(r.score)) throw new Error(`score not finite: ${r.score}`);
  }
  const top = Math.max(...board.map((r) => r.score), 0);
  if (!Number.isFinite(top)) throw new Error(`bar denominator is ${top}`);
  console.log(`✓ bar denominator is finite (${top}) — empty state will render`);

  const standing = await getPublicStanding(user.id);
  console.log(`✓ public standing: ${JSON.stringify(standing)}`);

  console.log("\nAll empty-database paths survive. ✓");
}

main()
  .catch((e) => {
    console.error("\nFAILED:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
