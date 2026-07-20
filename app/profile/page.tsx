import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getHeatmap, getMyProgress } from "@/lib/activity";
import { AppHeader } from "@/components/AppHeader";
import { HeatmapChart } from "@/components/HeatmapChart";
import { ProfileForm } from "./ProfileForm";
import { Card } from "@/components/ui";
import { IconFlame } from "@/components/icons";
import { getPublicStanding } from "@/lib/circle-governance";
import { PublicStanding } from "@/components/PublicStanding";

export default async function ProfilePage() {
  const user = await requireUser();
  const [heatmapData, progress, standing] = await Promise.all([
    getHeatmap(user.id),
    getMyProgress(user.id),
    getPublicStanding(user.id),
  ]);

  return (
    <>
      <AppHeader user={user}>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/circles"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors duration-[120ms] hover:bg-ink-900 hover:text-ink-300"
          >
            Home
          </Link>
          <Link
            href="/discover"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors duration-[120ms] hover:bg-ink-900 hover:text-ink-300"
          >
            Discover
          </Link>
          <span className="rounded-md bg-ink-800 px-2.5 py-1 text-xs font-medium text-ink-100">
            Profile
          </span>
        </nav>
      </AppHeader>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-accent">
            Account
          </p>
          <h1 className="mt-1 font-display text-4xl font-light tracking-tight">
            Your Profile
          </h1>
        </div>

        <div className="space-y-8">
          {/* GitHub-style Streak Chart / Heatmap */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                Activity (Last 90 Days)
              </h2>
              {progress.streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold border border-accent/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <IconFlame size={14} className="animate-pulse" />
                  <span>{progress.streak} Week Streak</span>
                </div>
              )}
            </div>
            <Card className="p-6">
              <HeatmapChart days={heatmapData} />
            </Card>
          </section>

          <PublicStanding standing={standing} />

          {/* Settings Form */}
          <section>
            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500 mb-3">
              Personal Information
            </h2>
            <Card className="p-6 sm:p-8">
              <ProfileForm user={user} />
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
