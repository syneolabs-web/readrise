import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCircleActivity, getMyProgress, getNotifications } from "@/lib/activity";
import { relativeTime, weekOf } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import { AppNav } from "@/components/AppNav";
import { Avatar, Datum, Spark, SectionHead } from "@/components/ui";
import { BookCover } from "@/components/BookCover";
import { GoalCard } from "@/components/GoalCard";
import { CheckinButton } from "@/components/CheckinButton";
import { FriendsRail } from "@/components/FriendsRail";
import { computeGoal } from "@/lib/reading-goal";
import { IconArrow } from "@/components/icons";
import { CircleActions } from "./CircleActions";

/**
 * Home: tonight, then the week, then the record.
 *
 * The old home opened on a title ("The reading ledger") and four counters,
 * and put the one thing you came to do — open your book at your page —
 * below the fold on a phone. The loop is daily: read a little, answer a
 * friend, keep this week's habit. So the page is ordered the same way:
 *
 * 1. Tonight — the book you're in, the page you're on, where your friends
 *    are, and one button that opens it at that page.
 * 2. This week — each circle's habit, with the check-in right there.
 * 3. Your shelf and what your circles did.
 * 4. Beside it: what's addressed to you, and what you've built.
 *
 * Nothing here is global or competitive — every figure is yours or your
 * circles' (D19, D27).
 */
export default async function DashboardPage() {
  const user = await requireUser();
  const thisWeek = weekOf();

  const [activity, progress, notifications, memberships] = await Promise.all([
    getCircleActivity(user.id, 12),
    getMyProgress(user.id),
    getNotifications(user.id, 4),
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

  return (
    <>
      <AppHeader user={user}>
        <AppNav active="home" />
      </AppHeader>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        {!hasCircles ? (
          <FirstRun name={user.name} />
        ) : (
          <>
            {/* ── Tonight ─────────────────────────────────────── */}
            <section aria-labelledby="tonight" className="border-b border-ink-800 pb-8">
              <p className="plate-label">
                {edition} · {user.name.split(" ")[0]}
              </p>

              {current ? (
                <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="min-w-0">
                    <h1 id="tonight" className="cover-title text-[length:clamp(2.1rem,5.4vw,4rem)] text-ink-100">
                      {current.page <= 1 ? "Tonight, start" : `Tonight, page ${current.page} of`}{" "}
                      <em className="not-italic text-accent">{current.title}.</em>
                    </h1>

                    <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-300 sm:text-lg">
                      {currentGoal && currentGoal.status !== "done"
                        ? currentGoal.headline
                        : friendsLine(current.doc.progress, user.id, current.page)}
                    </p>

                    {current.circle.memberships.length > 1 && (
                      <FriendsRail
                        members={current.circle.memberships.map((m) => m.user)}
                        progress={current.doc.progress}
                        pageCount={current.pageCount}
                        viewerId={user.id}
                        className="mt-6 max-w-xl"
                      />
                    )}

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/read/${current.id}`}
                        className="cover-label group inline-flex items-center gap-3 rounded-[3px] bg-series px-6 py-3.5 text-base font-bold text-series-ink transition-transform duration-[140ms] active:scale-[0.97]"
                      >
                        {current.page <= 1 ? "Start reading" : "Continue reading"}
                        <IconArrow size={16} />
                      </Link>
                      <Link
                        href={`/circles/${current.circle.slug}`}
                        className="cover-label inline-flex items-center rounded-[3px] px-3 py-3.5 text-sm font-semibold text-ink-300 underline-offset-4 hover:text-ink-100 hover:underline"
                      >
                        {current.circle.name}
                      </Link>
                    </div>
                  </div>

                  <Link
                    href={`/read/${current.id}`}
                    aria-hidden="true"
                    tabIndex={-1}
                    className="pressable hidden rotate-[2deg] lg:block"
                  >
                    <BookCover title={current.title} author={current.author} width={150} />
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <h1 id="tonight" className="cover-title text-[length:clamp(2.1rem,5.4vw,4rem)] text-ink-100">
                    Every book here is finished. Pick the next one.
                  </h1>
                  <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-300">
                    Upload a PDF to one of your circles and it&apos;s on everyone&apos;s
                    shelf by tonight.
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-800 pt-5">
                <CircleActions />
              </div>
            </section>

            <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-14">
              <div className="min-w-0 space-y-12">
                {/* ── This week ──────────────────────────────── */}
                <section aria-labelledby="week">
                  <SectionHead id="week" title="This week's habit" />
                  {habits.length === 0 ? (
                    <p className="mt-3 max-w-[56ch] border-y border-ink-800 py-4 text-sm leading-relaxed text-ink-400">
                      No habit set this week. In your circle, pick one concrete
                      thing the chapter says you should actually do —{" "}
                      <Link
                        href={`/circles/${memberships[0]!.circle.slug}`}
                        className="font-semibold text-ink-100 underline underline-offset-4"
                      >
                        commit to it together
                      </Link>
                      .
                    </p>
                  ) : (
                    <ul className="mt-3 border-t border-ink-800">
                      {habits.map((h) => (
                        <li
                          key={h.id}
                          className="flex flex-col gap-3 border-b border-ink-800 py-4 sm:flex-row sm:items-center sm:gap-5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="cover-label text-lg font-bold leading-snug text-ink-100">
                              {h.title}
                            </p>
                            <div className="mt-2 flex items-center gap-2.5">
                              <div className="flex -space-x-1.5">
                                {h.members.map((m) => {
                                  const did = h.checked.includes(m.id);
                                  return (
                                    <Avatar
                                      key={m.id}
                                      name={`${m.name} — ${did ? "done" : "not yet"}`}
                                      color={m.avatarColor}
                                      size={20}
                                      className={`ring-2 ring-ink-950 ${did ? "" : "opacity-30 grayscale"}`}
                                    />
                                  );
                                })}
                              </div>
                              <span className="fig text-xs text-ink-500">
                                {h.checked.length} of {h.members.length} done ·{" "}
                                <Link href={`/circles/${h.circle.slug}`} className="hover:text-ink-200 hover:underline">
                                  {h.circle.name}
                                </Link>
                              </span>
                            </div>
                          </div>
                          <CheckinButton
                            actionId={h.id}
                            done={h.checked.includes(user.id)}
                            className="self-start sm:self-center"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* ── Goals for books you brought ─────────────── */}
                {goals.length > 0 && (
                  <section aria-labelledby="goals">
                    <SectionHead id="goals" title="Books you set a goal for" />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

                {/* ── Shelf ─────────────────────────────────── */}
                <section aria-labelledby="shelf">
                  <SectionHead id="shelf" title="Your shelf" />
                  {books.length === 0 ? (
                    <p className="mt-3 border-y border-ink-800 py-4 text-sm text-ink-400">
                      No books yet. Open a circle and upload a PDF to start reading together.
                    </p>
                  ) : (
                    <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 md:grid-cols-4">
                      {books.slice(0, 8).map((b) => {
                        const pct = b.pageCount ? Math.min(100, (b.page / b.pageCount) * 100) : 0;
                        const done = b.pageCount > 0 && b.page >= b.pageCount;
                        return (
                          <li key={b.id} className="min-w-0">
                            <Link href={`/read/${b.id}`} className="group block">
                              <span className="pressable block w-fit">
                                <BookCover title={b.title} author={b.author} width={96} />
                              </span>
                              <span className="mt-3 block truncate text-sm font-semibold text-ink-100 group-hover:underline">
                                {b.title}
                              </span>
                              <span className="block truncate text-xs text-ink-500">{b.circle.name}</span>
                              <span className="mt-2 block h-1 w-full max-w-[96px] bg-ink-800">
                                <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
                              </span>
                              <span className="fig mt-1 block text-2xs text-ink-500">
                                {done ? "Finished" : `p${b.page} of ${b.pageCount || "?"}`}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                {/* ── Circle activity ────────────────────────── */}
                <section aria-labelledby="activity">
                  <SectionHead id="activity" title="In your circles" />
                  {activity.length === 0 ? (
                    <p className="mt-3 border-y border-ink-800 py-4 text-sm text-ink-400">
                      Quiet so far. Highlight something or start a thread, and it shows up here.
                    </p>
                  ) : (
                    <ol className="mt-3 border-t border-ink-800">
                      {activity.map((a) => (
                        <li key={a.id} className="border-b border-ink-800">
                          <Link href={a.href} className="group flex items-start gap-3 py-3">
                            <Avatar name={a.actor.name} color={a.actor.avatarColor} size={24} className="mt-0.5" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm leading-snug text-ink-300">
                                <span className="font-semibold text-ink-100">{a.actor.name}</span>{" "}
                                <span className="group-hover:text-ink-100">{a.summary}</span>
                              </span>
                              <span className="mt-0.5 block text-xs text-ink-500">
                                {a.circle.name} · {relativeTime(a.at)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>

              {/* ── Beside it ──────────────────────────────────── */}
              <aside className="min-w-0 space-y-12">
                <section aria-labelledby="for-you">
                  <SectionHead id="for-you" title="Addressed to you" />
                  {notifications.length === 0 ? (
                    <p className="mt-3 border-y border-ink-800 py-4 text-sm leading-relaxed text-ink-400">
                      When a friend answers one of your highlights, it lands here.
                    </p>
                  ) : (
                    <ul className="mt-3 border-t border-ink-800">
                      {notifications.map((n) => (
                        <li key={n.id} className="border-b border-ink-800">
                          <Link href={n.href} className="group flex items-start gap-3 py-3">
                            <Avatar name={n.actor.name} color={n.actor.avatarColor} size={24} className="mt-0.5" />
                            <span className="min-w-0 text-sm leading-snug text-ink-300">
                              <span className="font-semibold text-ink-100">{n.actor.name}</span>{" "}
                              <span className="group-hover:text-ink-100">{n.text}</span>
                              <span className="mt-0.5 block text-xs text-ink-500">{relativeTime(n.at)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-labelledby="built">
                  <SectionHead id="built" title="What you've built" />
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
                    <Datum
                      value={progress.streak}
                      label="Week streak"
                      sub={progress.streak ? "unbroken" : "starts this week"}
                    />
                    <Datum value={progress.insights} label="In the vault" sub="saved insights" />
                    <Datum value={progress.highlights} label="Highlights" sub="all time" />
                    <Datum value={progress.books} label={progress.books === 1 ? "Book" : "Books"} sub="opened" />
                  </div>
                  <div className="mt-6 border-t border-ink-800 pt-4">
                    <p className="plate-label">Highlights, last 7 days</p>
                    <Spark data={progress.week} className="mt-3" />
                  </div>
                </section>

                <section aria-labelledby="circles">
                  <SectionHead id="circles" title="Your circles" />
                  <ul className="mt-3 border-t border-ink-800">
                    {memberships.map((m) => (
                      <li key={m.id} className="border-b border-ink-800">
                        <Link
                          href={`/circles/${m.circle.slug}`}
                          className="group flex items-center justify-between gap-3 py-3"
                        >
                          <span className="min-w-0">
                            <span className="cover-label block truncate text-sm font-bold text-ink-100 group-hover:underline">
                              {m.circle.name}
                            </span>
                            <span className="text-xs text-ink-500">
                              {m.circle.memberships.length}{" "}
                              {m.circle.memberships.length === 1 ? "member" : "members"} ·{" "}
                              {m.circle.documents.length}{" "}
                              {m.circle.documents.length === 1 ? "book" : "books"}
                            </span>
                          </span>
                          <span className="flex shrink-0 -space-x-1.5">
                            {m.circle.memberships.slice(0, 4).map((x) => (
                              <Avatar
                                key={x.id}
                                name={x.user.name}
                                color={x.user.avatarColor}
                                size={22}
                                className="ring-2 ring-ink-950"
                              />
                            ))}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/discover"
                    className="cover-label mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-300 hover:text-ink-100"
                  >
                    Find a public circle <IconArrow size={14} />
                  </Link>
                </section>
              </aside>
            </div>
          </>
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
 * First run: no circles yet. The page's whole job is the first circle, so it
 * says how a circle starts in three steps and puts both ways in (start one,
 * or join a friend's) right there.
 */
function FirstRun({ name }: { name: string }) {
  return (
    <section aria-labelledby="first" className="py-6 sm:py-10">
      <p className="plate-label">Welcome, {name.split(" ")[0]}</p>
      <h1 id="first" className="cover-title mt-4 max-w-[18ch] text-[length:clamp(2.4rem,6.4vw,4.6rem)] text-ink-100">
        Every circle starts with one book and two friends.
      </h1>
      <ol className="mt-10 grid max-w-4xl gap-0 border-t border-ink-800 sm:grid-cols-3">
        {[
          ["Start a circle", "Name it after the book or the idea. Keep it small — two or three people who'll notice."],
          ["Bring a book", "Upload any PDF. Everyone reads the same pages, and highlights land on the exact words."],
          ["Send the link", "Your invite link shows friends which circle asked them, and survives their sign-up."],
        ].map(([title, body], i) => (
          <li key={title} className="border-b border-ink-800 py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
            <span className="fig cover-label text-sm font-bold text-accent">{i + 1}</span>
            <p className="cover-label mt-2 text-lg font-bold text-ink-100">{title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <CircleActions variant="banner" />
      </div>
    </section>
  );
}
