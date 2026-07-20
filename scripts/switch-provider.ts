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
// The two-URL requirement is the step people miss: `db push` against the
// transaction pooler fails in a way that doesn't obviously say "wrong port".
console.log(
  target === "postgresql"
    ? [
        "\nNext — in .env (NOT .env.local; the Prisma CLI only reads .env):",
        '  1. DATABASE_URL="…pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"',
        '     DIRECT_URL="…pooler.supabase.com:5432/postgres"',
        "     Both from Supabase → Connect → ORMs → Prisma. 6543 is the pooler",
        "     the app runs on; 5432 is the direct session db push needs.",
        "  2. npx prisma generate && npx prisma db push",
        "  3. Seeding is optional and DESTRUCTIVE — it wipes every table first:",
        "       SEED_ALLOW_REMOTE=yes npm run db:seed",
        "\nFull runbook: docs/DEPLOY.md",
      ].join("\n")
    : [
        "\nNext:",
        '  1. Set DATABASE_URL="file:./dev.db" and DIRECT_URL="file:./dev.db" in .env',
        "  2. npx prisma generate && npx prisma db push",
      ].join("\n")
);
