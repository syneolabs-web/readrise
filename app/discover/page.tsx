import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDiscover } from "@/lib/activity";
import { AppHeader } from "@/components/AppHeader";
import { Avatar, Card } from "@/components/ui";
import { BookCover } from "@/components/BookCover";
import { JoinButton } from "./JoinButton";

/**
 * Global Pulse / Discover: public reading circles to join, and the books
 * they're reading ranked by activity. This is the one surface that reads
 * across circles the viewer doesn't belong to — and only PUBLIC ones.
 */
export default async function DiscoverPage() {
  const user = await requireUser();
  const { circles, books } = await getDiscover(user.id);

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
          <span className="rounded-md bg-ink-800 px-2.5 py-1 text-xs font-medium text-ink-100">
            Discover
          </span>
          <Link
            href="/profile"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors duration-[120ms] hover:bg-ink-900 hover:text-ink-300"
          >
            Profile
          </Link>
        </nav>
      </AppHeader>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-accent">
            Global Pulse
          </p>
          <h1 className="mt-1 font-display text-4xl font-light tracking-tight">
            Find your circle
          </h1>
          <p className="mt-2 max-w-xl font-prose text-base leading-relaxed text-ink-400">
            Public reading circles anyone can join. Small groups, real books,
            people reading with intent — not an audience.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* ── Public circles ──────────────────────────── */}
          <section className="min-w-0">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Circles forming now
            </h2>
            <div className="mt-3 space-y-3">
              {circles.map((c) => (
                <Card key={c.slug} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ink-100">{c.name}</h3>
                        <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
                      </div>
                      {c.tagline && (
                        <p className="mt-1 font-prose text-sm leading-relaxed text-ink-400">
                          {c.tagline}
                        </p>
                      )}
                    </div>
                    <JoinButton slug={c.slug} joined={c.joined} />
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {c.avatars.map((a, i) => (
                        <Avatar
                          key={i}
                          name={a.name}
                          color={a.color}
                          size={22}
                          className="ring-2 ring-ink-900"
                        />
                      ))}
                    </div>
                    <span className="text-2xs text-ink-500">
                      {c.memberCount} {c.memberCount === 1 ? "member" : "members"}
                      {c.book && ` · reading “${c.book.title}”`}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── Popular books ───────────────────────────── */}
          <aside className="min-w-0">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Most highlighted
            </h2>
            <Card className="mt-3 divide-y divide-ink-850">
              {books.map((b, i) => (
                <Link
                  key={b.id}
                  href={`/circles/${b.circleSlug}`}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-ink-850"
                >
                  <span className="w-4 text-center font-display text-lg font-semibold text-ink-600 [font-variant-numeric:lining-nums]">
                    {i + 1}
                  </span>
                  <BookCover title={b.title} author={b.author} width={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-100">
                      {b.title}
                    </p>
                    <p className="truncate text-2xs text-ink-600">
                      {b.circleName}
                    </p>
                  </div>
                  <span className="shrink-0 text-2xs tabular-nums text-ink-500">
                    {b.highlights} ★
                  </span>
                </Link>
              ))}
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}
