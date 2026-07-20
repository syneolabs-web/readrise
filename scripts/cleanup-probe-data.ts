/**
 * Remove the throwaway accounts, circles and uploads created while debugging
 * production (the "probe" data). Safe to run more than once.
 *
 * These were made against the live database while reproducing the upload
 * failure, so they need clearing from production specifically — which is why
 * this script does NOT carry the local-only guard that prisma/seed.ts has. It
 * is narrow instead: it only ever touches rows whose email or slug matches the
 * probe patterns below, and it names everything it deletes before doing it.
 *
 * Run with the production connection string, e.g.
 *   npx tsx scripts/cleanup-probe-data.ts
 * (reads DATABASE_URL from .env like every other script)
 */
import { db } from "../lib/db";
import { deleteStoredFile } from "../lib/storage";

const EMAIL_PATTERNS = [
  "claude-upload-probe",
  "claude-bigupload-probe",
  "probe-db-check",
  "probe-db2",
  "probe-recheck",
];
const SLUG_PREFIXES = ["probe-circle", "bigprobe"];

async function main() {
  const users = await db.user.findMany({
    where: { OR: EMAIL_PATTERNS.map((p) => ({ email: { contains: p } })) },
    select: { id: true, email: true },
  });

  const circles = await db.circle.findMany({
    where: { OR: SLUG_PREFIXES.map((p) => ({ slug: { startsWith: p } })) },
    select: { id: true, slug: true },
  });

  // Storage objects outlive their rows unless we remove them explicitly —
  // the 6MB test PDF would otherwise sit in the bucket forever.
  const docs = await db.document.findMany({
    where: {
      OR: [
        { uploadedById: { in: users.map((u) => u.id) } },
        { circleId: { in: circles.map((c) => c.id) } },
      ],
    },
    select: { id: true, title: true, storageKey: true },
  });

  console.log(`users:   ${users.length}`, users.map((u) => u.email));
  console.log(`circles: ${circles.length}`, circles.map((c) => c.slug));
  console.log(`files:   ${docs.length}`, docs.map((d) => d.title));

  if (!users.length && !circles.length && !docs.length) {
    console.log("\nNothing to clean. ✓");
    return;
  }

  for (const d of docs) {
    await deleteStoredFile(d.storageKey).catch((e) =>
      console.warn(`  could not delete ${d.storageKey}: ${e.message}`)
    );
  }

  // Cascades handle memberships, highlights, documents and the rest.
  const c = await db.circle.deleteMany({ where: { id: { in: circles.map((x) => x.id) } } });
  const u = await db.user.deleteMany({ where: { id: { in: users.map((x) => x.id) } } });

  console.log(`\nDeleted ${u.count} users, ${c.count} circles, ${docs.length} stored files. ✓`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
