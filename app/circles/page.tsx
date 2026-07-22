import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCircleActivity, getMyProgress } from "@/lib/activity";
import { relativeTime } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import { Avatar, Card } from "@/components/ui";
import { StatRing } from "@/components/StatRing";
import { WeeklyChart } from "@/components/WeeklyChart";
import { BookCover } from "@/components/BookCover";
import { GoalCard } from "@/components/GoalCard";
import { computeGoal } from "@/lib/reading-goal";
import { IconArrow, IconFlame, IconStarFilled } from "@/components/icons";
import { CircleActions } from "./CircleActions";

/**
 * The home after login: an activity dashboard (per the reference direction).
 * Three panels — what your circles are doing, what you're reading, and what
 * you've built. All from circles you belong to; discovery lives on /discover.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  const [activity, progress, memberships] = await Promise.all([
    getCircleActivity(user.id),
    getMyProgress(user.id),
    db.membership.findMany({
      where: { userId: user.id },
      include: {
        circle: {
          include: {
            documents: {
              orderBy: { createdAt: "desc" },
              include: { progress: { where: { userId: user.id } } },
            },
            _count: { select: { memberships: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  // Goals belong to whoever uploaded the book — they made the commitment, so
  // it's their home it shows up on. Finished goals drop off rather than
  // lingering as a to-do that's already done.
  const goals = memberships
    .flatMap((m) => m.circle.documents)
    .filter((d) => d.uploadedById === user.id)
    .map((d) => ({
      documentId: d.id,
      title: d.title,
      pageCount: d.pageCount,
      page: d.progress[0]?.currentPage ?? 1,
      goal: computeGoal({ ...d, currentPage: d.progress[0]?.currentPage ?? 1 }),
    }))
    .filter((g) => g.goal !== null && g.goal.status !== "done")
    .slice(0, 3);

  // Flatten the viewer's books across circles for the reading snapshot.
  const books = memberships
    .flatMap((m) =>
      m.circle.documents.map((d) => ({
        id: d.id,
        title: d.title,
        author: d.author,
        pageCount: d.pageCount,
        page: d.progress[0]?.currentPage ?? 1,
        circleName: m.circle.name,
      }))
    )
    .slice(0, 6);

  return (
    <>
      <AppHeader user={user}>
        <nav className="hidden items-center gap-1 sm:flex">
          <span className="rounded-md bg-ink-800 px-2.5 py-1 text-xs font-medium text-ink-100">
            Home
          </span>
          <Link
            href="/discover"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors duration-[120ms] hover:bg-ink-900 hover:text-ink-300"
          >
            Discover
          </Link>
          <Link
            href="/profile"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors duration-[120ms] hover:bg-ink-900 hover:text-ink-300"
          >
            Profile
          </Link>
        </nav>
      </AppHeader>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-accent">
              Welcome back, {user.name}
            </p>
            <h1 className="mt-1 font-display text-4xl font-light tracking-tight">
              Your reading, today
            </h1>
          </div>
          {memberships.length > 0 && <CircleActions />}
        </div>

        {memberships.length === 0 && (
          <div className="mt-8">
            <CircleActions variant="banner" />
          </div>
        )}

        {/* Stacks below lg. The source order is activity → reading → built,
            which is right on desktop where all three are side by side, but
            wrong stacked: it buries your books and goals under a feed you have
            to scroll past. `order-*` puts reading first on small screens
            without disturbing the desktop columns. */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr_18rem]">
          {/* ── Circle activity ─────────────────────────── */}
          <section className="order-2 min-w-0 lg:order-none">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              In your circles
            </h2>
            {activity.length === 0 ? (
              <Card className="mt-3 border-dashed p-5">
                <p className="text-xs leading-relaxed text-ink-500">
                  Quiet so far. Highlight something, start a thread, and your
                  circle&apos;s activity shows up here.
                </p>
              </Card>
            ) : (
              <ol className="mt-3 space-y-4 border-l border-ink-800 pl-4">
                {activity.slice(0, 10).map((a) => (
                  <li key={a.id} className="relative">
                    <span
                      className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-accent ring-4 ring-ink-950"
                      aria-hidden="true"
                    />
                    <Link href={a.href} className="group block">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar
                          name={a.actor.name}
                          color={a.actor.avatarColor}
                          image={(a.actor as any).avatarImage}
                          size={18}
                        />
                        <p className="min-w-0 break-words text-xs text-ink-300">
                          <span className="font-medium text-ink-100">
                            {a.actor.name}
                          </span>{" "}
                          {a.summary}
                        </p>
                      </div>
                      <p className="mt-1 pl-6 text-2xs text-ink-600">
                        {a.circle.name} · {relativeTime(a.at)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* ── Reading snapshot ────────────────────────── */}
          <section className="order-1 min-w-0 lg:order-none">
            {/* Goals sit above the shelf: a deadline you set is the thing most
                likely to decide what you open next. */}
            {goals.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Your reading goals
                </h2>
                <div className="mt-3 space-y-2.5">
                  {goals.map((g) => (
                    <GoalCard
                      key={g.documentId}
                      goal={g.goal!}
                      documentId={g.documentId}
                      title={g.title}
                      page={g.page}
                      pageCount={g.pageCount}
                    />
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Pick up where you left off
            </h2>
            {books.length === 0 ? (
              <Card className="mt-3 border-dashed p-8 text-center">
                <p className="text-sm font-medium text-ink-300">No books yet</p>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-500">
                  Open a circle and upload a PDF to start reading together.
                </p>
              </Card>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {books.map((b) => {
                  const pct = b.pageCount ? (b.page / b.pageCount) * 100 : 0;
                  return (
                    <Link key={b.id} href={`/read/${b.id}`} className="min-w-0">
                      <Card className="pressable group flex h-full gap-3 p-3 hover:border-ink-700 hover:bg-ink-850">
                        <BookCover title={b.title} author={b.author} width={46} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <h3 className="truncate text-sm font-medium text-ink-100 transition-colors group-hover:text-accent">
                            {b.title}
                          </h3>
                          <p className="truncate text-2xs text-ink-600">
                            {b.circleName}
                          </p>
                          <div className="mt-auto pt-2">
                            <div className="h-1 overflow-hidden rounded-full bg-ink-800">
                              <div
                                className="bg-grad h-full rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="mt-1 text-2xs tabular-nums text-ink-600">
                              p{b.page} / {b.pageCount || "?"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Your circles, compact */}
            <h2 className="mt-6 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Your circles
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {memberships.map((m) => (
                <Link
                  key={m.id}
                  href={`/circles/${m.circle.slug}`}
                  className="pressable group inline-flex items-center gap-2 rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 hover:border-ink-700 hover:bg-ink-850"
                >
                  <span className="text-xs font-medium text-ink-200 group-hover:text-accent">
                    {m.circle.name}
                  </span>
                  <span className="text-2xs text-ink-600">
                    {m.circle._count.memberships}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── My progress ─────────────────────────────── */}
          <aside className="order-3 min-w-0 space-y-4 lg:order-none">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              What you&apos;ve built
            </h2>
            <Card className="space-y-4 p-5">
              <StatRing
                value={progress.streak}
                fraction={progress.streak ? Math.min(1, progress.streak / 8) : 0}
                icon={<IconFlame size={18} />}
                label="week streak"
                sub={progress.streak ? "keep it alive" : "check in this week"}
              />
              <StatRing
                value={progress.insights}
                icon={<IconStarFilled size={16} />}
                label="insights saved"
                sub="your vault"
              />
              <div className="border-t border-ink-800 pt-4">
                <p className="mb-2 text-2xs font-medium text-ink-400">
                  Highlights this week
                </p>
                <WeeklyChart data={progress.week} />
              </div>
            </Card>

            <Link href="/discover">
              <Card className="group flex items-center justify-between gap-3 p-4 transition-colors hover:border-accent/40 hover:bg-ink-850">
                <div>
                  <h3 className="text-sm font-medium text-ink-100 transition-colors group-hover:text-accent">
                    Discover circles
                  </h3>
                  <p className="mt-0.5 text-2xs text-ink-500">
                    Public reading circles to join
                  </p>
                </div>
                <span className="text-ink-600 transition-transform duration-[120ms] group-hover:translate-x-0.5">
                  <IconArrow size={14} />
                </span>
              </Card>
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}
