import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { weekOf } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import { Avatar, Card } from "@/components/ui";
import { IconArrow, IconFlame, IconStarFilled } from "@/components/icons";
import { CircleNav } from "@/components/CircleNav";
import { StatRing } from "@/components/StatRing";
import { BookCover } from "@/components/BookCover";
import { getLeaderboard, getOpenProposal } from "@/lib/circle-governance";
import { UploadButton } from "./UploadButton";
import { MicroActions } from "./MicroActions";
import { InviteCode } from "./InviteCode";
import { PublishVote } from "./PublishVote";
import { Leaderboard, ShoutoutStrip } from "./Leaderboard";
import { AdminPanel } from "./AdminPanel";

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

  // The circle's accumulated work, for the stat rings. All real, all
  // collective — nothing competitive or global (D3).
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

  return (
    <>
      <AppHeader user={user}>
        <CircleNav slug={slug} name={circle.name} active="books" />
      </AppHeader>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{circle.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {circle.memberships.map((m) => (
                  <Avatar
                    key={m.id}
                    name={m.user.name}
                    color={m.user.avatarColor}
                    size={22}
                    className="ring-2 ring-ink-950"
                  />
                ))}
              </div>
              <span className="text-xs text-ink-500">
                {circle.memberships.map((m) => m.user.name).join(", ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InviteCode
              code={circle.inviteCode}
              circleId={circle.id}
              isOwner={isAdmin}
            />
            <UploadButton circleId={circle.id} />
          </div>
        </div>

        {/* ── Governance ─────────────────────────────────
            Private circles see the motion to go public; public ones see the
            standings, the shoutouts, and (for the admin) moderation. */}
        <PublishVote
          circleId={circle.id}
          isPublic={circle.isPublic}
          proposal={proposal}
          viewerId={user.id}
          memberCount={memberCount}
        />

        {circle.isPublic && (
          <>
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
            {isAdmin && (
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
            )}
          </>
        )}

        {/* ── What the circle has built ────────────────
            Extracted from the reference "My Progress" rings. Collective,
            accumulated, never competitive — the Vault as the forest you
            won't abandon (RESEARCH §5). */}
        <div className="mt-7 grid grid-cols-2 gap-4 rounded-xl border border-ink-800 bg-ink-900 p-5 sm:grid-cols-4">
          <StatRing
            value={streak}
            fraction={streak ? Math.min(1, streak / 8) : 0}
            icon={<IconFlame size={18} />}
            label={`week streak`}
            sub={streak ? "everyone checked in" : "start one this week"}
          />
          <StatRing
            value={circle._count.vaultEntries}
            label="insights"
            sub="in the vault"
          />
          <StatRing
            value={circle.documents.length}
            label={circle.documents.length === 1 ? "book" : "books"}
            sub="read together"
          />
          <StatRing
            value={totalHighlights}
            label="highlights"
            sub="in the margins"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          {/* ── Books ─────────────────────────────────── */}
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
              Reading
            </h2>

            {circle.documents.length === 0 ? (
              <Card className="mt-3 border-dashed">
                <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
                  <p className="text-sm font-medium text-ink-300">No books yet</p>
                  <p className="max-w-xs text-xs leading-relaxed text-ink-500">
                    Upload a PDF to start reading together. Everyone&apos;s highlights
                    show up in the margins, live.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="mt-3 space-y-3">
                {circle.documents.map((doc) => {
                  const mine = doc.progress.find((p) => p.userId === user.id);
                  const pct = doc.pageCount
                    ? ((mine?.currentPage ?? 1) / doc.pageCount) * 100
                    : 0;

                  return (
                    <Link key={doc.id} href={`/read/${doc.id}`}>
                      <Card className="group flex gap-4 p-4 transition-colors hover:border-ink-700 hover:bg-ink-850">
                        <BookCover title={doc.title} author={doc.author} />
                        <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate font-medium text-ink-100 transition-colors group-hover:text-accent">
                              {doc.title}
                            </h3>
                            {doc.author && (
                              <p className="truncate text-xs text-ink-600">
                                {doc.author}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 text-[11px] text-ink-600">
                            {doc._count.highlights}{" "}
                            {doc._count.highlights === 1 ? "highlight" : "highlights"}
                          </span>
                        </div>

                        {/* Progress Match, compact */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-800">
                            <div
                              className="bg-grad h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-[10px] tabular-nums text-ink-600">
                            p{mine?.currentPage ?? 1} / {doc.pageCount || "?"}
                          </span>
                          <div className="flex shrink-0 -space-x-1">
                            {circle.memberships.map((m) => {
                              const p = doc.progress.find((x) => x.userId === m.userId);
                              return (
                                <Avatar
                                  key={m.id}
                                  name={`${m.user.name} — p${p?.currentPage ?? 1}`}
                                  color={m.user.avatarColor}
                                  size={16}
                                  className="ring-2 ring-ink-900"
                                />
                              );
                            })}
                          </div>
                        </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Sidebar ───────────────────────────────── */}
          <div className="space-y-6">
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
              members={circle.memberships.map((m) => m.user)}
              viewerId={user.id}
              thisWeek={thisWeek}
              memberCount={memberCount}
            />

            <Link href={`/circles/${slug}/vault`}>
              <Card className="group p-4 transition-colors hover:border-accent/40 hover:bg-ink-850">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-accent">
                      <IconStarFilled size={14} />
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-ink-100 transition-colors duration-[120ms] group-hover:text-accent">
                        Insight Vault
                      </h3>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {circle._count.vaultEntries}{" "}
                        {circle._count.vaultEntries === 1 ? "insight" : "insights"}{" "}
                        across every book
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-ink-600 transition-transform duration-[120ms] group-hover:translate-x-0.5">
                    <IconArrow size={14} />
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
