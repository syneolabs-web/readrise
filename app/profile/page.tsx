import { requireUser } from "@/lib/auth";
import { getHeatmap, getMyProgress } from "@/lib/activity";
import { AppHeader } from "@/components/AppHeader";
import { AppNav } from "@/components/AppNav";
import { HeatmapChart } from "@/components/HeatmapChart";
import { ProfileForm } from "./ProfileForm";
import { Avatar, Datum, SectionHead } from "@/components/ui";
import { getPublicStanding } from "@/lib/circle-governance";
import { PublicStanding } from "@/components/PublicStanding";

/**
 * You: your record first (the practice), your settings after (the account).
 * The streak used to sit in a glowing, permanently pulsing badge — a loop
 * animation (banned, D15) on the exact number the product promises never to
 * dramatise. It's a figure in the record now, like every other figure.
 */
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
        <AppNav active="profile" />
      </AppHeader>

      <main className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        <header className="flex flex-wrap items-center gap-5 border-b border-ink-800 pb-8">
          <Avatar name={user.name} color={user.avatarColor} image={user.avatarImage} size={72} />
          <div className="min-w-0">
            <p className="plate-label">Your record</p>
            <h1 className="cover-title mt-2 text-[length:clamp(2.2rem,5.6vw,3.6rem)] text-ink-100">{user.name}</h1>
          </div>
        </header>

        <section aria-labelledby="record" className="mt-10">
          <SectionHead id="record" title="What you've built" />
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-ink-800 py-5 sm:grid-cols-4">
            <Datum value={progress.streak} label="Week streak" sub={progress.streak ? "unbroken" : "starts this week"} />
            <Datum value={progress.highlights} label="Highlights" sub="all time" />
            <Datum value={progress.insights} label="In the vault" sub="saved insights" />
            <Datum value={progress.books} label={progress.books === 1 ? "Book" : "Books"} sub="opened" />
          </div>
        </section>

        <section aria-labelledby="days" className="mt-12">
          <SectionHead id="days" title="The last 90 days" />
          <div className="mt-4">
            <HeatmapChart days={heatmapData} />
          </div>
        </section>

        <div className="mt-12">
          <PublicStanding standing={standing} />
        </div>

        <section aria-labelledby="account" className="mt-14 border-t border-ink-800 pt-8">
          <SectionHead id="account" title="Account" />
          <div className="mt-6">
            <ProfileForm user={user} />
          </div>
        </section>
      </main>
    </>
  );
}
