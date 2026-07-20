import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  buildPdf,
  BODY_LEADING,
  BODY_SIZE,
  HEADING_LEADING,
  HEADING_SIZE,
  MARGIN,
  PAGE_H,
  PAGE_W,
  type PdfLine,
} from "../scripts/pdf-builder";
import { textWidth } from "../scripts/helvetica-metrics";
import { saveFile } from "../lib/storage";
import { weekOf } from "../lib/utils";
import type { NormalizedRect } from "../lib/types";
import { BOOK_AUTHOR, BOOK_PAGES, BOOK_TITLE, MILESTONES } from "./book-content";
import { DISCOVERY_CIRCLES, EXTRA_PEOPLE } from "./discovery-content";

const db = new PrismaClient();

// Geometry shared with the PDF writer, so the rects the seed computes and the
// glyphs the viewer paints are derived from the same numbers.
const TOP = PAGE_H - MARGIN;

/** Baseline y of a line, walking down by each preceding line's leading. */
function baselineOf(lines: PdfLine[], lineIndex: number): number {
  let y = TOP;
  for (let j = 0; j < lineIndex; j++) {
    y -= lines[j]!.heading ? HEADING_LEADING : BODY_LEADING;
  }
  return y;
}

/**
 * Rect for a character range within a single line.
 *
 * x and width come from real Helvetica advance widths rather than an average
 * character width — see scripts/helvetica-metrics.ts. With an average, the
 * error accumulates across a line and the highlight lands several characters
 * right of its text.
 */
function rectForRange(
  lines: PdfLine[],
  lineIndex: number,
  from: number,
  to: number
): NormalizedRect {
  const line = lines[lineIndex]!;
  const bold = Boolean(line.heading);
  const fontSize = bold ? HEADING_SIZE : BODY_SIZE;
  const ascent = fontSize * 0.718; // Helvetica cap height, 718/1000 em
  const baseline = baselineOf(lines, lineIndex);

  const before = textWidth(line.text.slice(0, from), fontSize, bold);
  const width = textWidth(line.text.slice(from, to), fontSize, bold);

  return {
    x: (MARGIN + before) / PAGE_W,
    y: (PAGE_H - (baseline + ascent)) / PAGE_H,
    w: width / PAGE_W,
    h: (fontSize * 1.0) / PAGE_H,
  };
}

/**
 * Compute normalized rects for a snippet of seeded text.
 *
 * The seed generates the PDF, so it knows exactly where every line sits. That
 * lets seeded highlights land on real sentences instead of floating over the
 * page at random — which matters, because these highlights are the first proof
 * that the anchoring math is right.
 *
 * A snippet may wrap across lines, producing one rect per line spanned —
 * the same multi-rect shape a real browser selection produces.
 */
function rectsForSnippet(
  lines: PdfLine[],
  snippet: string
): { rects: NormalizedRect[]; start: number; end: number } | null {
  // Flatten to the same space-joined text the wrap() split from, so snippets
  // written as continuous prose still match after wrapping.
  const offsets: number[] = [];
  let cursor = 0;
  for (const l of lines) {
    offsets.push(cursor);
    cursor += l.text.length + 1; // +1 for the join separator
  }
  const flat = lines.map((l) => l.text).join(" ");

  const start = flat.indexOf(snippet);
  if (start === -1) return null;
  const end = start + snippet.length;

  const rects: NormalizedRect[] = [];
  lines.forEach((line, i) => {
    const lineStart = offsets[i]!;
    const lineEnd = lineStart + line.text.length;
    const from = Math.max(start, lineStart);
    const to = Math.min(end, lineEnd);
    if (to > from) rects.push(rectForRange(lines, i, from - lineStart, to - lineStart));
  });

  return rects.length ? { rects, start, end } : null;
}

/**
 * Refuse to wipe a database that isn't obviously a local scratch one.
 *
 * Everything below deletes every row in every table. That is correct for a
 * local SQLite file and catastrophic against the hosted database once real
 * people have accounts in it — and the two are one `.env` edit apart. The
 * guard is opt-out rather than opt-in because the failure is unrecoverable:
 * seeding a remote DB on purpose costs one extra flag, seeding it by accident
 * costs everything.
 */
function assertSafeToWipe() {
  const url = process.env.DATABASE_URL ?? "";
  const isLocal =
    url.startsWith("file:") ||
    /@(localhost|127\.0\.0\.1)[:/]/.test(url);

  if (isLocal || process.env.SEED_ALLOW_REMOTE === "yes") return;

  console.error(
    "\nRefusing to seed: DATABASE_URL does not look like a local database.\n" +
      "This script DELETES EVERY ROW before inserting demo data.\n\n" +
      `  target: ${url.replace(/:[^:@/]+@/, ":****@") || "(unset)"}\n\n` +
      "If you really mean to wipe it — a fresh Supabase project, say — re-run with:\n" +
      "  SEED_ALLOW_REMOTE=yes npm run db:seed\n"
  );
  process.exit(1);
}

async function main() {
  console.log("Seeding Prodoxity…\n");

  assertSafeToWipe();

  // Idempotent: wipe in FK-safe order so `npm run db:seed` can be re-run.
  await db.vaultEntry.deleteMany();
  await db.actionCheckin.deleteMany();
  await db.microAction.deleteMany();
  await db.readingProgress.deleteMany();
  await db.chatMessage.deleteMany();
  await db.commentVote.deleteMany();
  await db.comment.deleteMany();
  await db.highlight.deleteMany();
  await db.milestone.deleteMany();
  await db.document.deleteMany();
  await db.membership.deleteMany();
  await db.circle.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [pratik, maya, dev] = await Promise.all([
    db.user.create({
      data: { email: "pratik@prodoxity.dev", name: "Pratik", passwordHash, avatarColor: "#6366f1" },
    }),
    db.user.create({
      data: { email: "maya@prodoxity.dev", name: "Maya", passwordHash, avatarColor: "#ec4899" },
    }),
    db.user.create({
      data: { email: "dev@prodoxity.dev", name: "Dev", passwordHash, avatarColor: "#14b8a6" },
    }),
  ]);
  console.log("✓ 3 users");

  const circle = await db.circle.create({
    data: {
      name: "Growth Mindset",
      slug: "growth-mindset",
      inviteCode: "GROWTH24",
      memberships: {
        create: [
          { userId: pratik.id, role: "owner" },
          { userId: maya.id, role: "member" },
          { userId: dev.id, role: "member" },
        ],
      },
    },
  });
  console.log("✓ circle 'Growth Mindset' (invite GROWTH24)");

  const pdf = buildPdf(BOOK_PAGES);
  const storageKey = await saveFile(pdf, "pdf");
  console.log(`✓ generated PDF (${(pdf.length / 1024).toFixed(1)}KB, ${BOOK_PAGES.length}pp)`);

  const document = await db.document.create({
    data: {
      circleId: circle.id,
      title: BOOK_TITLE,
      author: BOOK_AUTHOR,
      storageKey,
      pageCount: BOOK_PAGES.length,
      uploadedById: pratik.id,
      // Backdated so the demo dashboard shows a live goal mid-flight rather
      // than a fresh one that hasn't had time to mean anything.
      goalDays: 10,
      goalStartedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      goalRitual: "after dinner, before my phone",
    },
  });

  const milestones = [];
  for (const m of MILESTONES) {
    milestones.push(await db.milestone.create({ data: { ...m, documentId: document.id } }));
  }
  console.log(`✓ ${milestones.length} milestones`);

  // ── Highlights anchored to real sentences ───────────────────
  const seeds: {
    page: number;
    snippet: string;
    user: { id: string };
    color: string;
    comments?: { user: { id: string }; body: string }[];
  }[] = [
    {
      page: 1,
      snippet: "It is a wish wearing the costume of a plan",
      user: maya,
      color: "yellow",
      comments: [
        { user: pratik, body: "This one stung. I have a Notion board full of these." },
        { user: maya, body: "Right? The board IS the costume." },
      ],
    },
    {
      page: 2,
      snippet: "no thanks, I am not a smoker",
      user: pratik,
      color: "green",
      comments: [
        {
          user: dev,
          body: "The reframe is doing a lot of work here, but I buy it. It's the difference between resisting and just... not being that person.",
        },
      ],
    },
    {
      page: 2,
      snippet: "Every action you take is a vote for the type of person",
      user: dev,
      color: "blue",
      comments: [
        { user: maya, body: "This is the thesis of the whole book in one line." },
        { user: pratik, body: "Agreed — pinning this to the Vault." },
      ],
    },
    {
      page: 3,
      snippet: "The goal of the first week is attendance",
      user: maya,
      color: "purple",
      comments: [
        { user: pratik, body: "Attendance over progress. Stealing this for the gym." },
      ],
    },
    {
      page: 4,
      snippet: "Never miss twice",
      user: pratik,
      color: "pink",
      comments: [
        { user: dev, body: "Two is the beginning of a new identity — brutal and true." },
      ],
    },
  ];

  const created: { id: string; text: string }[] = [];

  for (const s of seeds) {
    const lines = BOOK_PAGES[s.page - 1]!;
    const found = rectsForSnippet(lines, s.snippet);
    if (!found) {
      throw new Error(
        `Seed snippet not found on p${s.page}: "${s.snippet}". ` +
          `Fix the snippet in prisma/seed.ts to match prisma/book-content.ts.`
      );
    }

    const highlight = await db.highlight.create({
      data: {
        documentId: document.id,
        userId: s.user.id,
        pageNumber: s.page,
        rects: found.rects,
        textContent: s.snippet,
        textStart: found.start,
        textEnd: found.end,
        color: s.color,
      },
    });
    created.push({ id: highlight.id, text: s.snippet });

    for (const c of s.comments ?? []) {
      const comment = await db.comment.create({
        data: { highlightId: highlight.id, userId: c.user.id, body: c.body },
      });
      // A couple of upvotes so the vote UI has state on first load.
      if (Math.random() > 0.5) {
        await db.commentVote.create({
          data: { commentId: comment.id, userId: maya.id },
        }).catch(() => {});
      }
    }
  }
  console.log(`✓ ${created.length} highlights with threads`);

  // ── Progress: deliberately uneven, so gating & Progress Match are visible ──
  await db.readingProgress.createMany({
    data: [
      { userId: pratik.id, documentId: document.id, currentPage: 5 },
      { userId: maya.id, documentId: document.id, currentPage: 4 },
      { userId: dev.id, documentId: document.id, currentPage: 2 }, // Ch.3 room locked for Dev
    ],
  });
  console.log("✓ reading progress (Dev is behind — Ch.3 room is locked for him)");

  // ── Lounge + a milestone room ───────────────────────────────
  await db.chatMessage.createMany({
    data: [
      { circleId: circle.id, userId: pratik.id, body: "Alright — Ch. 1–2 by Sunday. Everyone good?" },
      { circleId: circle.id, userId: maya.id, body: "In. Already ahead 😤" },
      { circleId: circle.id, userId: dev.id, body: "Give me until Monday, work is brutal this week." },
      { circleId: circle.id, userId: pratik.id, body: "Monday works. Never miss twice though 👀" },
      {
        circleId: circle.id,
        userId: maya.id,
        milestoneId: milestones[0]!.id,
        body: "The smoker reframe in ch.1 is the part I keep coming back to.",
      },
      {
        circleId: circle.id,
        userId: pratik.id,
        milestoneId: milestones[0]!.id,
        body: "Same. It reframes willpower as a design failure rather than a character flaw.",
      },
    ],
  });
  console.log("✓ lounge + milestone room messages");

  // ── The accountability loop — the actual product ────────────
  const thisWeek = weekOf();
  const action = await db.microAction.create({
    data: {
      circleId: circle.id,
      documentId: document.id,
      milestoneId: milestones[1]!.id,
      createdById: pratik.id,
      title: "Read one page before opening any app in the morning",
      detail:
        "Straight from the two-minute door. One page. Phone stays in the other room until it's done.",
      weekOf: thisWeek,
    },
  });
  await db.actionCheckin.createMany({
    data: [
      { microActionId: action.id, userId: pratik.id, done: true },
      { microActionId: action.id, userId: maya.id, done: true },
      // Dev hasn't checked in — the streak UI needs an incomplete state.
    ],
  });

  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastAction = await db.microAction.create({
    data: {
      circleId: circle.id,
      documentId: document.id,
      milestoneId: milestones[0]!.id,
      createdById: maya.id,
      title: "Say the identity sentence out loud once a day",
      detail: "'I am someone who reads.' Feels stupid. Doing it anyway.",
      weekOf: weekOf(lastWeekDate),
    },
  });
  await db.actionCheckin.createMany({
    data: [
      { microActionId: lastAction.id, userId: pratik.id, done: true },
      { microActionId: lastAction.id, userId: maya.id, done: true },
      { microActionId: lastAction.id, userId: dev.id, done: true },
    ],
  });
  console.log("✓ micro-actions (this week + last week, for the streak)");

  // ── Insight Vault ───────────────────────────────────────────
  if (created[2]) {
    await db.vaultEntry.create({
      data: {
        circleId: circle.id,
        addedById: pratik.id,
        highlightId: created[2].id,
        note: "The core mechanic of the whole book. Every small action is a ballot.",
      },
    });
  }
  if (created[4]) {
    await db.vaultEntry.create({
      data: {
        circleId: circle.id,
        addedById: dev.id,
        highlightId: created[4].id,
        note: "Our circle rule now: miss one, fine. Miss two, you owe the group coffee.",
      },
    });
  }
  await db.vaultEntry.create({
    data: {
      circleId: circle.id,
      addedById: maya.id,
      microActionId: lastAction.id,
      note: "Everyone hit this one. Worth repeating next month.",
    },
  });
  console.log("✓ vault entries");

  // ── Public discovery circles (Global Pulse) ─────────────────
  // Fabricated members so public circles look alive on Discover.
  const extras = await Promise.all(
    EXTRA_PEOPLE.map((person, i) =>
      db.user.create({
        data: {
          email: `${person.name.toLowerCase()}@readers.dev`,
          name: person.name,
          passwordHash,
          avatarColor: person.color,
        },
      })
    )
  );

  let discoverCount = 0;
  for (const dc of DISCOVERY_CIRCLES) {
    // Pick a rotating subset of the extra people as members.
    const members = extras.slice(0, dc.extraMembers);
    const owner = members[0]!;

    const pubCircle = await db.circle.create({
      data: {
        name: dc.name,
        slug: dc.slug,
        inviteCode: dc.inviteCode,
        isPublic: true,
        tagline: dc.tagline,
        memberships: {
          create: members.map((m, i) => ({
            userId: m.id,
            role: i === 0 ? "owner" : "member",
          })),
        },
      },
    });

    const pubPdf = buildPdf(dc.book.pages);
    const pubKey = await saveFile(pubPdf, "pdf");
    const pubDoc = await db.document.create({
      data: {
        circleId: pubCircle.id,
        title: dc.book.title,
        author: dc.book.author,
        storageKey: pubKey,
        pageCount: dc.book.pages.length,
        uploadedById: owner.id,
      },
    });

    // A little activity: progress + a couple of highlights, so "reading now"
    // counts and the discovery cards aren't empty.
    for (const m of members) {
      await db.readingProgress.create({
        data: {
          userId: m.id,
          documentId: pubDoc.id,
          currentPage: 1 + Math.floor(Math.random() * dc.book.pages.length),
        },
      });
    }
    // One anchored highlight on page 2 (first content page) for realism.
    const firstBody = dc.book.pages[1];
    if (firstBody) {
      const line = firstBody.find((l) => l.text && !l.heading);
      if (line) {
        await db.highlight.create({
          data: {
            documentId: pubDoc.id,
            userId: owner.id,
            pageNumber: 2,
            rects: [{ x: 0.1176, y: 0.12, w: 0.5, h: 0.018 }],
            textContent: line.text.slice(0, 60),
            textStart: 0,
            textEnd: Math.min(60, line.text.length),
            color: "green",
          },
        });
      }
    }

    discoverCount++;
  }
  console.log(`✓ ${discoverCount} public discovery circles`);

  console.log("\n──────────────────────────────────────");
  console.log("Done. Sign in at http://localhost:3000");
  console.log("  pratik@prodoxity.dev / password123");
  console.log("  maya@prodoxity.dev   / password123");
  console.log("  dev@prodoxity.dev    / password123");
  console.log("──────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
