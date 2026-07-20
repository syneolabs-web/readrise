import { PrismaClient } from "@prisma/client";

/** Undo memberships/code changes created while verifying the invite flow. */
const db = new PrismaClient();

async function main() {
  await db.circle.update({
    where: { slug: "growth-mindset" },
    data: { inviteCode: "GROWTH24" },
  });

  const pairs: [string, string][] = [
    ["sofia@readers.dev", "growth-mindset"],
    ["pratik@prodoxity.dev", "the-alchemist-circle"],
  ];
  for (const [email, slug] of pairs) {
    const user = await db.user.findUnique({ where: { email } });
    const circle = await db.circle.findUnique({ where: { slug } });
    if (user && circle) {
      const { count } = await db.membership.deleteMany({
        where: { userId: user.id, circleId: circle.id },
      });
      if (count) console.log(`removed ${email} from ${slug}`);
    }
  }

  const c = await db.circle.findUnique({
    where: { slug: "growth-mindset" },
    include: { memberships: true },
  });
  console.log(`restored code=${c?.inviteCode} members=${c?.memberships.length}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
