import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { weekOf } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import { Avatar, Datum, SectionHead } from "@/components/ui";
import { IconArrow, IconStarFilled } from "@/components/icons";
import { CircleNav } from "@/components/CircleNav";
import { BookCover } from "@/components/BookCover";
import { FriendsRail } from "@/components/FriendsRail";
import { getLeaderboard, getOpenProposal } from "@/lib/circle-governance";
import { UploadButton } from "./UploadButton";
import { MicroActions } from "./MicroActions";
import { InviteCode } from "./InviteCode";
import { PublishVote } from "./PublishVote";
import { Leaderboard, ShoutoutStrip } from "./Leaderboard";
import { AdminPanel } from "./AdminPanel";

/**
 * A circle's home.
 *
 * Ordered by how often each thing is used. It used to open with the motion
 * to go public — an action a circle takes at most once — and pushed the book
 * everyone is reading below the fold. Now:
 *
 * 1. The circle: who's in it, and how to bring someone else in.
 * 2. What you're reading together, with everyone's place in it, beside this
 *    week's habit — the READ and COMMIT halves of the loop, side by side.
 * 3. The circle's record, then (for public circles) standings and shoutouts.
 * 4. Circle settings at the foot: the invite key and the go-public vote.
 *    An OPEN vote is the exception — it needs everyone's answer, so it
 *    moves to the top until it closes.
 */
export default async function CirclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const circle = await db.circle.findUnique({
    where: { slug },
    include: {
      memberships: {
        include: { user: { select: { id: true, name: true, avatarColor: true } } },
        orderBy: { joinedAt: "asc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        include: {
          progress: true,
          _count: { select: { highlights: true } },
        },
      },
      actions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          checkins: true,
          createdBy: { select: { id: true, name: true } },
          milestone: { select: { title: true } },
        },
      },
      _count: { select: { vaultEntries: true } },
    },
  });

  if (!circle) notFound();

  const membership = circle.memberships.find((m) => m.userId === user.id);
  if (!membership) notFound();

  const thisWeek = weekOf();
  const memberCount = circle.memberships.length;
  const members = circle.memberships.map((m) => m.user);

  // The circle's accumulated work. All real, all collective — nothing
  // competitive or global (D19).
  const totalHighlights = circle.documents.reduce(
    (sum, d) => sum + d._count.highlights,
    0
  );
  // Streak: consecutive most-recent past weeks where every member checked in
  // (mirrors MicroActions' countStreak — the circle's, not an individual's).
  const streak = (() => {
    const byWeek = new Map<string, typeof circle.actions>();
    for (const a of circle.actions) {
      if (a.weekOf === thisWeek) continue;
      const list = byWeek.get(a.weekOf) ?? [];
      list.push(a);
      byWeek.set(a.weekOf, list);
    }
    let n = 0;
    for (const w of [...byWeek.keys()].sort().reverse()) {
      const complete = byWeek
        .get(w)!
        .every((a) => a.checkins.length === memberCount);
      if (!complete) break;
      n++;
    }
    return n;
  })();

  // ── Governance ────────────────────────────────────────────
  const isAdmin = membership.role === "owner";
  const [proposal, standings, shoutouts] = await Promise.all([
    circle.isPublic ? Promise.resolve(null) : getOpenProposal(circle.id),
    circle.isPublic ? getLeaderboard(circle.id) : Promise.resolve([]),
    circle.isPublic
      ? db.shoutout.findMany({
          where: { circleId: circle.id },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            to: { select: { name: true, avatarColor: true } },
            from: { select: { name: true } },
            highlight: { select: { textContent: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const vote = (
    <PublishVote
      circleId={circle.id}
      isPublic={circle.isPublic}
      proposal={proposal}
      viewerId={user.id}
      memberCount={memberCount}
    />
  );

  return (
    <>
      <AppHeader user={user}>
        <CircleNav slug={slug} name={circle.name} active="books" />
      </AppHeader>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        {/* ── The circle ───────────────────────────────────── */}
        <header className="border-b border-ink-800 pb-7">
          <p className="plate-label">
            {circle.isPublic ? "Public circle" : "Private circle"} · {memberCount}{" "}
            {memberCount === 1 ? "member" : "members"}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div className="min-w-0">
              <h1 className="cover-title text-[length:clamp(2.2rem,5.6vw,4rem)] text-ink-100">
                {circle.name}
              </h1>
              {circle.tagline && (
                <p className="mt-2 max-w-[56ch] font-prose text-lg italic text-ink-300">
                  {circle.tagline}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  {circle.memberships.map((m) => (
                    <Avatar
                      key={m.id}
                      name={m.user.name}
                      color={m.user.avatarColor}
                      size={26}
                      className="ring-2 ring-ink-950"
                    />
                  ))}
                </div>
                <span className="text-sm text-ink-400">
                  {circle.memberships
                    .map((m) => (m.userId === user.id ? "you" : m.user.name.split(" ")[0]))
                    .join(", ")}
                </span>
              </div>
            </div>
            <UploadButton circleId={circle.id} />
          </div>
        </header>

        {/* An open vote needs every member's answer — it leads until it closes. */}
        {proposal && <div className="mt-6">{vote}</div>}

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_21rem] lg:gap-14">
          <div className="min-w-0 space-y-12">
            {/* ── Reading together ─────────────────────────── */}
            <section aria-labelledby="reading">
              <SectionHead id="reading" title="Reading together" />

              {circle.documents.length === 0 ? (
                <div className="mt-3 border-y border-ink-800 py-8">
                  <p className="cover-label text-xl font-bold text-ink-100">
                    Bring the first book.
                  </p>
                  <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-400">
                    Upload a PDF and it&apos;s on everyone&apos;s shelf. Highlights
                    land on the exact words, and friends answer in the margin, live.
                  </p>
                  <div className="mt-5">
                    <UploadButton circleId={circle.id} />
                  </div>
                </div>
              ) : (
                <ul className="mt-3 border-t border-ink-800">
                  {circle.documents.map((doc) => {
                    const mine = doc.progress.find((p) => p.userId === user.id);
                    const page = mine?.currentPage ?? 1;
                    const done = doc.pageCount > 0 && page >= doc.pageCount;

                    return (
                      <li key={doc.id} className="border-b border-ink-800 py-6">
                        <div className="flex gap-5">
                          <Link href={`/read/${doc.id}`} className="pressable shrink-0" tabIndex={-1} aria-hidden="true">
                            <BookCover title={doc.title} author={doc.author} width={84} />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                              <h3 className="min-w-0">
                                <Link
                                  href={`/read/${doc.id}`}
                                  className="cover-label text-xl font-bold leading-tight text-ink-100 hover:underline"
                                >
                                  {doc.title}
                                </Link>
                              </h3>
                              <span className="fig shrink-0 text-xs text-ink-500">
                                {doc._count.highlights}{" "}
                                {doc._count.highlights === 1 ? "highlight" : "highlights"}
                              </span>
                            </div>
                            {doc.author && <p className="mt-0.5 text-sm text-ink-400">{doc.author}</p>}

                            {memberCount > 1 ? (
                              <FriendsRail
                                members={members}
                                progress={doc.progress}
                                pageCount={doc.pageCount}
                                viewerId={user.id}
                                className="mt-4 max-w-md"
                              />
                            ) : null}

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <Link
                                href={`/read/${doc.id}`}
                                className="cover-label inline-flex items-center gap-2 rounded-[3px] bg-series px-4 py-2.5 text-sm font-bold text-series-ink transition-transform duration-[140ms] active:scale-[0.97]"
                              >
                                {done ? "Read again" : page <= 1 ? "Start reading" : `Continue from p${page}`}
                                <IconArrow size={14} />
                              </Link>
                              <span className="fig text-xs text-ink-500">
                                {done
                                  ? "You've finished it"
                                  : `${doc.pageCount - page} ${doc.pageCount - page === 1 ? "page" : "pages"} to go`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* ── The circle's record ──────────────────────── */}
            <section aria-labelledby="record">
              <SectionHead id="record" title="What this circle has built" />
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-ink-800 py-5 sm:grid-cols-4">
                <Datum value={streak} label="Week streak" sub={streak ? "everyone checked in" : "starts this week"} />
                <Datum value={circle._count.vaultEntries} label="Insights" sub="in the vault" />
                <Datum
                  value={circle.documents.length}
                  label={circle.documents.length === 1 ? "Book" : "Books"}
                  sub="read together"
                />
                <Datum value={totalHighlights} label="Highlights" sub="in the margins" />
              </div>
            </section>

            {/* ── Public circles: standings and shoutouts ──── */}
            {circle.isPublic && (
              <section className="space-y-8">
                <ShoutoutStrip
                  shoutouts={shoutouts.map((s) => ({
                    id: s.id,
                    note: s.note,
                    toName: s.to.name,
                    toColor: s.to.avatarColor,
                    fromName: s.from.name,
                    text: s.highlight?.textContent ?? null,
                  }))}
                />
                <Leaderboard
                  circleId={circle.id}
                  rows={standings}
                  isAdmin={isAdmin}
                  config={{
                    lbEnabled: circle.lbEnabled,
                    lbWeightPages: circle.lbWeightPages,
                    lbWeightHighlights: circle.lbWeightHighlights,
                    lbWeightDiscussion: circle.lbWeightDiscussion,
                  }}
                />
              </section>
            )}
          </div>

          {/* ── This week, and the vault ─────────────────────── */}
          <aside className="min-w-0 space-y-10">
            <MicroActions
              circleId={circle.id}
              documents={circle.documents.map((d) => ({ id: d.id, title: d.title }))}
              actions={circle.actions.map((a) => ({
                id: a.id,
                title: a.title,
                detail: a.detail,
                weekOf: a.weekOf,
                createdBy: a.createdBy.name,
                milestoneTitle: a.milestone?.title ?? null,
                checkedInBy: a.checkins.map((c) => c.userId),
              }))}
              members={members}
              viewerId={user.id}
              thisWeek={thisWeek}
              memberCount={memberCount}
            />

            <Link
              href={`/circles/${slug}/vault`}
              className="group block border-y border-ink-800 py-4"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-start gap-3">
                  <span className="mt-0.5 text-accent">
                    <IconStarFilled size={16} />
                  </span>
                  <span>
                    <span className="cover-label block text-base font-bold text-ink-100 group-hover:underline">
                      The vault
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-400">
                      {circle._count.vaultEntries}{" "}
                      {circle._count.vaultEntries === 1 ? "insight" : "insights"} kept, across every book
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-ink-500 transition-transform duration-[120ms] group-hover:translate-x-0.5">
                  <IconArrow size={16} />
                </span>
              </span>
            </Link>
          </aside>
        </div>

        {/* ── Circle settings ─────────────────────────────────
            Things a circle does rarely. Kept on the page — every member
            should be able to find the invite key and see how going public
            works — but no longer in front of the book. */}
        <section aria-labelledby="settings" className="mt-16 border-t border-ink-800 pt-8">
          <SectionHead id="settings" title="Circle settings" />
          <div className="mt-5 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="cover-label text-base font-bold text-ink-100">Invite someone</h3>
              <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-ink-400">
                Send the link — it shows them which circle asked, and keeps the
                code through their sign-up. Or read the code out loud.
              </p>
              <div className="mt-4">
                <InviteCode code={circle.inviteCode} circleId={circle.id} isOwner={isAdmin} />
              </div>
            </div>
            {!proposal && !circle.isPublic && <div>{vote}</div>}
          </div>

          {circle.isPublic && isAdmin && (
            <div className="mt-10">
              <AdminPanel
                circleId={circle.id}
                viewerId={user.id}
                members={circle.memberships.map((m) => ({
                  userId: m.userId,
                  name: m.user.name,
                  avatarColor: m.user.avatarColor,
                  role: m.role,
                }))}
              />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
