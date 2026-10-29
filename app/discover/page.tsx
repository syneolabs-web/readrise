import { requireUser } from "@/lib/auth";
import { getDiscover } from "@/lib/activity";
import { AppHeader } from "@/components/AppHeader";
import { AppNav } from "@/components/AppNav";
import { DiscoverHero } from "@/components/discover/DiscoverHero";
import { HowCirclesWorkDiagram } from "@/components/discover/HowCirclesWorkDiagram";
import { PublicCirclesShowcase } from "@/components/discover/PublicCirclesShowcase";
import { ArguedBooksRadar } from "@/components/discover/ArguedBooksRadar";
import { IconSparkles, IconUsers, IconBookmark } from "@/components/icons";

export default async function DiscoverPage() {
  const user = await requireUser();
  const { circles, books } = await getDiscover(user.id);

  return (
    <>
      <AppHeader user={user}>
        <AppNav active="discover" />
      </AppHeader>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6 sm:pb-16 sm:pt-6 space-y-6 sm:space-y-8">
        {/* 1. Global Pulse Hero with Quick Invite Code Input */}
        <section aria-labelledby="discover-hero">
          <DiscoverHero />
        </section>

        {/* 2. How Circles Work (3-Stage Visual Diagram) */}
        <section aria-labelledby="how-circles-work">
          <HowCirclesWorkDiagram />
        </section>

        {/* 3. Main Discover Grid (Public Circles Showcase + Argued Books Radar) */}
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:gap-7 items-start">
          {/* Left: Open Circles with Filter Tracks */}
          <section aria-labelledby="circles-showcase" className="min-w-0">
            <PublicCirclesShowcase circles={circles} />
          </section>

          {/* Right: Argued Books Radar */}
          <aside aria-labelledby="books-radar" className="min-w-0">
            <ArguedBooksRadar books={books} />
          </aside>
        </div>

        {/* 4. Anti-Feed Ethos Callout */}
        <section className="rounded-3xl border border-ink-800/60 bg-ink-950/30 p-5 sm:p-6 text-center max-w-2xl mx-auto">
          <span className="cover-label text-3xs font-bold uppercase tracking-widest text-ink-500 block">
            The Readrise Standard
          </span>
          <p className="mt-2 text-xs sm:text-sm text-ink-300 leading-relaxed font-prose italic">
            &ldquo;We don&apos;t build infinite feeds or algorithmic recommendations. We build small sanctuaries where two or three people read deeply, challenge each other&apos;s thoughts, and turn good books into lasting habits.&rdquo;
          </p>
        </section>
      </main>
    </>
  );
}
