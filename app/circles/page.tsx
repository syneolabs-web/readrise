import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCircleActivity, getMyProgress, getNotifications } from "@/lib/activity";
import { weekOf } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import { AppNav } from "@/components/AppNav";
import { GoalCard } from "@/components/GoalCard";
import { computeGoal } from "@/lib/reading-goal";
import { CircleActions } from "./CircleActions";
import { ReadingHeroCard } from "@/components/dashboard/ReadingHeroCard";
import { ReadingLoopDiagram } from "@/components/dashboard/ReadingLoopDiagram";
import { HabitMatrixCard } from "@/components/dashboard/HabitMatrixCard";
import { ShelfShowcase } from "@/components/dashboard/ShelfShowcase";
import { ReadingStatsLedger } from "@/components/dashboard/ReadingStatsLedger";
import { ActivityFeedTimeline } from "@/components/dashboard/ActivityFeedTimeline";
import { CircleOrbitCard } from "@/components/dashboard/CircleOrbitCard";
import { IconSparkles } from "@/components/icons";

/**
 * Modernized Diagrammatic Home Dashboard:
 * 1. Command Stage / Hero: Compact 2-column card with actions & stats.
 * 2. Circle Reading Loop: Streamlined, collapsible 5-stage tracker.
 * 3. Primary Column: Circle Activity Stream front-and-center + Shared Bookshelf.
 * 4. Sidebar: Weekly Habit challenge + Personal Ledger + Circles Orbit.
 */
export default async function DashboardPage() {
  const user = await requireUser();
  const thisWeek = weekOf();

  const [activity, progress, notifications, memberships] = await Promise.all([
    getCircleActivity(user.id, 10),
    getMyProgress(user.id),
    getNotifications(user.id, 3),
    db.membership.findMany({
      where: { userId: user.id },
      include: {
        circle: {
          include: {
            documents: {
              orderBy: { createdAt: "desc" },
              include: {
                progress: {
                  include: { user: { select: { id: true, name: true, avatarColor: true } } },
                },
              },
            },
            memberships: {
              include: { user: { select: { id: true, name: true, avatarColor: true } } },
              orderBy: { joinedAt: "asc" },
            },
            actions: {
              where: { weekOf: thisWeek },
              orderBy: { createdAt: "asc" },
              include: { checkins: { select: { userId: true } } },
            },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  const edition = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Every book you can read, with your page in it.
  const books = memberships.flatMap((m) =>
    m.circle.documents.map((d) => {
      const mine = d.progress.find((p) => p.userId === user.id);
      return {
        id: d.id,
        title: d.title,
        author: d.author,
        pageCount: d.pageCount,
        page: mine?.currentPage ?? 1,
        touched: mine?.updatedAt ?? null,
        circle: m.circle,
        doc: d,
      };
    })
  );

  // Tonight's book: the unfinished one you touched most recently; failing
  // that, the newest one you haven't opened.
  const unfinished = books.filter((b) => !b.pageCount || b.page < b.pageCount);
  const current =
    [...unfinished]
      .filter((b) => b.touched)
      .sort((a, b) => b.touched!.getTime() - a.touched!.getTime())[0] ??
    unfinished[0] ??
    null;

  const currentGoal = current
    ? computeGoal({ ...current.doc, currentPage: current.page })
    : null;

  // Goals for books you brought, except the one already leading the page.
  const goals = books
    .filter((b) => b.doc.uploadedById === user.id && b.id !== current?.id)
    .map((b) => ({ b, goal: computeGoal({ ...b.doc, currentPage: b.page }) }))
    .filter((g) => g.goal && g.goal.status !== "done")
    .slice(0, 2);

  const habits = memberships.flatMap((m) =>
    m.circle.actions.map((a) => ({
      id: a.id,
      title: a.title,
      circle: m.circle,
      members: m.circle.memberships.map((x) => x.user),
      checked: a.checkins.map((c) => c.userId),
    }))
  );

  const hasCircles = memberships.length > 0;
  const firstCircleSlug = memberships[0]?.circle.slug;
  const isHabitDone = habits.some((h) => h.checked.includes(user.id));

  return (
    <>
      <AppHeader user={user}>
        <AppNav active="home" />
      </AppHeader>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        {!hasCircles ? (
          <FirstRun name={user.name} />
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* 1. Command Stage / Hero Card */}
            <section aria-labelledby="tonight">
              <ReadingHeroCard
                current={current}
                currentGoal={currentGoal}
                user={user}
                edition={edition}
                friendsLineText={
                  current
                    ? friendsLine(current.doc.progress, user.id, current.page)
                    : "Conquered your shelf!"
                }
                progress={progress}
              />
            </section>

            {/* 2. The Social Reading Loop (Compact Streamlined Diagram) */}
            <section aria-label="Reading loop cycle">
              <ReadingLoopDiagram
                stats={{
                  books: books.length,
                  highlights: progress.highlights,
                  activity: activity.length,
                  habitsDone: isHabitDone,
                  insights: progress.insights,
                }}
              />
            </section>

            {/* 3. Main Dashboard Grid (Balanced 2 Columns) */}
            <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:gap-6 items-start">
              {/* Left Column: Circle Activity Stream + Shared Bookshelf */}
              <div className="min-w-0 space-y-5 sm:space-y-6">
                {/* Circle Activity Stream */}
                <section aria-labelledby="activity">
                  <ActivityFeedTimeline
                    activity={activity}
                    notifications={notifications}
                  />
                </section>

                {/* Shared Bookshelf */}
                <section aria-labelledby="shelf">
                  <ShelfShowcase
                    books={books}
                    firstCircleSlug={firstCircleSlug}
                  />
                </section>

                {/* Goals for books you brought */}
                {goals.length > 0 && (
                  <section aria-labelledby="goals" className="space-y-3">
                    <h2 id="goals" className="cover-label text-2xs font-bold uppercase tracking-[0.14em] text-ink-400">
                      Reading Goals
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {goals.map(({ b, goal }) => (
                        <GoalCard
                          key={b.id}
                          goal={goal!}
                          documentId={b.id}
                          title={b.title}
                          page={b.page}
                          pageCount={b.pageCount}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Weekly Habit + Reader's Ledger + Circles Orbit */}
              <aside className="min-w-0 space-y-5 sm:space-y-6">
                {/* Weekly Habit Matrix */}
                <section aria-labelledby="week">
                  <HabitMatrixCard
                    habits={habits}
                    userId={user.id}
                    firstCircleSlug={firstCircleSlug}
                  />
                </section>

                {/* Personal Ledger */}
                <section aria-labelledby="built">
                  <ReadingStatsLedger progress={progress} />
                </section>

                {/* Your Circles Orbit */}
                <section aria-labelledby="circles">
                  <CircleOrbitCard memberships={memberships} />
                </section>
              </aside>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/** One line about the others, in the product's no-shame register. */
function friendsLine(
  progress: { userId: string; currentPage: number; user: { name: string } }[],
  viewerId: string,
  mine: number
): string {
  const others = progress.filter((p) => p.userId !== viewerId);
  if (others.length === 0) return "You're the first one in. Your friends will see where you got to.";
  const ahead = others.filter((p) => p.currentPage > mine).sort((a, b) => b.currentPage - a.currentPage);
  if (ahead.length > 0) {
    const a = ahead[0]!;
    return `${a.user.name.split(" ")[0]} is on page ${a.currentPage} — there's a margin waiting for you.`;
  }
  return "You're out in front. Leave a note in the margin for whoever reaches it next.";
}

/**
 * Modernized First Run Experience.
 */
function FirstRun({ name }: { name: string }) {
  return (
    <section aria-labelledby="first" className="py-6 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-850 px-3 py-1 text-2xs font-semibold text-ink-300">
          <IconSparkles size={13} className="text-accent" />
          <span>Welcome, {name.split(" ")[0]}</span>
        </div>

        <h1 id="first" className="cover-title mt-3 max-w-[20ch] text-[length:clamp(2rem,4.5vw,3.4rem)] font-bold text-ink-100 leading-tight">
          Every circle starts with one book and two friends.
        </h1>

        <p className="mt-3 max-w-[54ch] text-xs leading-relaxed text-ink-400 sm:text-sm">
          Readrise turns solitary book reading into an intimate, shared conversation with people who notice when you read.
        </p>

        {/* 3 Step Cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4">
            <span className="font-display text-xs font-bold text-accent">01</span>
            <h3 className="cover-label mt-1.5 text-sm font-bold text-ink-100">Start a circle</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">
              Name it after the book or the idea. Keep it small — two or three people who notice.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4">
            <span className="font-display text-xs font-bold text-accent">02</span>
            <h3 className="cover-label mt-1.5 text-sm font-bold text-ink-100">Bring a book</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">
              Upload any PDF. Everyone reads the same pages, and highlights land on the exact words.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4">
            <span className="font-display text-xs font-bold text-accent">03</span>
            <h3 className="cover-label mt-1.5 text-sm font-bold text-ink-100">Send the link</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">
              Your invite link shows friends which circle asked them, and survives their sign-up.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <CircleActions variant="banner" />
        </div>
      </div>
    </section>
  );
}
