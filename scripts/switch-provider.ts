import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Flip the Prisma datasource provider between sqlite (dev) and postgresql (prod).
 *
 * This is only a one-line change because the schema obeys the PARITY RULE:
 * no enums, no scalar lists. See prisma/schema.prisma.
 */

const target = process.argv[2];
if (target !== "sqlite" && target !== "postgresql") {
  console.error("Usage: tsx scripts/switch-provider.ts <sqlite|postgresql>");
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const schema = readFileSync(schemaPath, "utf8");

const updated = schema.replace(
  /(datasource db \{[\s\S]*?provider\s*=\s*)"[^"]+"/,
  `$1"${target}"`
);

if (updated === schema) {
  console.log(`Provider already set to "${target}" — nothing to do.`);
  process.exit(0);
}

writeFileSync(schemaPath, updated);
console.log(`✓ Provider switched to "${target}".`);
console.log(
  target === "postgresql"
    ? "\nNext:\n  1. Set DATABASE_URL=postgresql://...\n  2. npx prisma db push\n  3. Swap lib/events.ts to Redis/LISTEN-NOTIFY if deploying multi-instance (see BLUEPRINT §4)"
    : "\nNext:\n  1. Set DATABASE_URL=\"file:./dev.db\"\n  2. npx prisma db push"
);
