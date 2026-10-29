import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getHeatmap, getMyProgress } from "@/lib/activity";
import { getPublicStanding } from "@/lib/circle-governance";
import { AppHeader } from "@/components/AppHeader";
import { AppNav } from "@/components/AppNav";
import { HeatmapChart } from "@/components/HeatmapChart";
import { PublicStanding } from "@/components/PublicStanding";
import { ProfileForm } from "./ProfileForm";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileBentoStats } from "@/components/profile/ProfileBentoStats";
import { ProfileCirclesGrid } from "@/components/profile/ProfileCirclesGrid";
import { ProfileNotebook } from "@/components/profile/ProfileNotebook";

export default async function ProfilePage() {
  const user = await requireUser();

  const [heatmapData, progress, standing, userDetails, recentHighlights] = await Promise.all([
    getHeatmap(user.id),
    getMyProgress(user.id),
    getPublicStanding(user.id),
    db.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          include: {
            circle: {
              include: {
                documents: {
                  take: 1,
                  orderBy: { createdAt: "desc" },
                  select: { id: true, title: true, author: true },
                },
                _count: { select: { memberships: true, documents: true } },
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    }),
    db.highlight.findMany({
      where: { userId: user.id },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            author: true,
            circle: { select: { name: true, slug: true } },
          },
        },
      },
    }),
  ]);

  const memberships = userDetails?.memberships ?? [];
  const createdAt = userDetails?.createdAt;

  return (
    <>
      <AppHeader user={user}>
        <AppNav active="profile" />
      </AppHeader>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6 sm:pb-16 sm:pt-6 space-y-6 sm:space-y-8">
        {/* 1. Reader Passport & Identity Banner */}
        <section aria-labelledby="reader-passport">
          <ProfileHero
            user={{
              ...user,
              createdAt,
            }}
            stats={{
              streak: progress.streak,
              highlights: progress.highlights,
              books: progress.books,
              circlesCount: memberships.length,
            }}
          />
        </section>

        {/* 2. What You've Built (Bento Stats Grid) */}
        <section aria-labelledby="what-youve-built" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 id="what-youve-built" className="cover-label text-xs font-bold uppercase tracking-[0.14em] text-ink-400">
              Reader&apos;s Record & Contributions
            </h2>
            <span className="text-3xs text-ink-500 font-semibold">
              Collective Memory
            </span>
          </div>

          <ProfileBentoStats progress={progress} />
        </section>

        {/* 3. 90-Day Reading Pulse Heatmap */}
        <section aria-labelledby="reading-pulse">
          <HeatmapChart days={heatmapData} />
        </section>

        {/* 4. Active Reading Circles Pods */}
        <section aria-labelledby="your-circles">
          <ProfileCirclesGrid memberships={memberships as any} />
        </section>

        {/* 5. Personal Commonplace Notebook (Highlights & Margin Notes) */}
        <section aria-labelledby="recent-quotes">
          <ProfileNotebook highlights={recentHighlights as any} />
        </section>

        {/* 6. Public Circle Standing (if in public circles) */}
        {standing.tier && standing.entries.length > 0 && (
          <section aria-labelledby="public-standing" className="rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-6 shadow-sm">
            <PublicStanding standing={standing} />
          </section>
        )}

        {/* 7. Account & Reading Preferences Settings */}
        <section aria-labelledby="account-settings" className="rounded-3xl border border-ink-800/80 bg-ink-900 p-6 sm:p-8 shadow-sm">
          <div className="border-b border-ink-800/70 pb-4 mb-6">
            <h2 id="account-settings" className="cover-title text-xl font-bold text-ink-100">
              Account & Reading Preferences
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              Control your public reader identity, avatar style, and reading appearance
            </p>
          </div>

          <ProfileForm user={user} />
        </section>
      </main>
    </>
  );
}
