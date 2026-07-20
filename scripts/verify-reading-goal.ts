/**
 * Verifies the reading-goal feature end to end against the real database:
 * sets goals in three different states on seeded books, prints what the
 * dashboard would say, then restores the rows it touched.
 *
 * Run: npx tsx scripts/verify-reading-goal.ts
 */
import { db } from "../lib/db";
import { computeGoal } from "../lib/reading-goal";

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const user = await db.user.findUnique({ where: { email: "pratik@prodoxity.dev" } });
  if (!user) throw new Error("Seed the DB first: npm run db:seed");

  const doc = await db.document.findFirst({
    where: { uploadedById: user.id },
    include: { progress: { where: { userId: user.id } } },
  });
  if (!doc) throw new Error("No document uploaded by pratik in the seed");

  const before = {
    goalDays: doc.goalDays,
    goalStartedAt: doc.goalStartedAt,
    goalRitual: doc.goalRitual,
  };

  const page = doc.progress[0]?.currentPage ?? 1;
  console.log(`Book: ${doc.title} — ${doc.pageCount} pages, reader on p${page}\n`);

  // Three states, driven purely by where goalStartedAt sits relative to now.
  const cases: [string, number, number][] = [
    ["fresh 14-day goal", 14, 0],
    ["10-day goal, 8 days in", 10, 8],
    ["10-day goal, 3 days past", 10, 13],
  ];

  for (const [label, days, daysAgo] of cases) {
    const updated = await db.document.update({
      where: { id: doc.id },
      data: {
        goalDays: days,
        goalStartedAt: new Date(Date.now() - daysAgo * DAY),
        goalRitual: "after dinner, before my phone",
      },
    });

    const goal = computeGoal({ ...updated, currentPage: page });
    if (!goal) throw new Error(`${label}: computeGoal returned null`);

    console.log(`${label}`);
    console.log(`  status   ${goal.status}`);
    console.log(`  headline ${goal.headline}`);
    console.log(`  ${goal.daysLeft} days left · ${goal.paceNeeded}/day · ${goal.pagesLeft} pages to go`);

    // The rule the whole design rests on: never shame the reader.
    if (/behind|fail|missed|only|should/i.test(goal.headline)) {
      throw new Error(`SHAMING COPY in "${label}": ${goal.headline}`);
    }
    console.log();
  }

  await db.document.update({ where: { id: doc.id }, data: before });
  console.log("Restored original goal fields. ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
