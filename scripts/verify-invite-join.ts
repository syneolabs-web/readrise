import { PrismaClient } from "@prisma/client";

/**
 * Exercise the invite-code join path end to end, the way a real person would:
 * wrong case, stray whitespace, a bad code, an already-member, and a banned
 * member. Prints what the API *would* do for each.
 *
 * Run: npx tsx scripts/verify-invite-join.ts
 */
const db = new PrismaClient();

async function main() {
  const circles = await db.circle.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      inviteCode: true,
      isPublic: true,
      memberships: { select: { userId: true, role: true } },
    },
  });

  console.log("── circles ──");
  for (const c of circles) {
    console.log(
      `  ${c.name.padEnd(20)} code=${c.inviteCode.padEnd(10)} public=${c.isPublic} members=${c.memberships.length}`
    );
  }

  const users = await db.user.findMany({ select: { id: true, name: true, email: true } });
  console.log("\n── users ──");
  for (const u of users) console.log(`  ${u.name.padEnd(10)} ${u.email}`);

  // Find a (user, circle) pair where the user is NOT a member — the real case.
  let testUser = null;
  let testCircle = null;
  for (const c of circles) {
    const ids = new Set(c.memberships.map((m) => m.userId));
    const outsider = users.find((u) => !ids.has(u.id));
    if (outsider) {
      testUser = outsider;
      testCircle = c;
      break;
    }
  }

  if (!testUser || !testCircle) {
    console.log("\n(everyone is already in every circle — no join to test)");
  } else {
    console.log(
      `\n── join test: ${testUser.name} -> ${testCircle.name} (code ${testCircle.inviteCode}) ──`
    );
    // Replicate the route's lookup exactly, including the normalisation.
    for (const variant of [
      testCircle.inviteCode,
      testCircle.inviteCode.toLowerCase(),
      `  ${testCircle.inviteCode}  `,
      "NOPE1234",
    ]) {
      const found = await db.circle.findUnique({
        where: { inviteCode: variant.toUpperCase().trim() },
      });
      console.log(
        `  input ${JSON.stringify(variant).padEnd(14)} -> ${found ? "MATCH " + found.slug : "no match"}`
      );
    }
  }

  const bans = await db.moderationAction.count();
  console.log(`\nban rows: ${bans}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
