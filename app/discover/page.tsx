import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDiscover } from "@/lib/activity";
import { AppHeader } from "@/components/AppHeader";
import { AppNav } from "@/components/AppNav";
import { Avatar, SectionHead } from "@/components/ui";
import { BookCover } from "@/components/BookCover";
import { JoinButton } from "./JoinButton";

/**
 * Discover: public reading circles to join, and the books they're arguing
 * about. The one surface that reads across circles the viewer doesn't belong
 * to — and only PUBLIC ones, which every member voted to open (D24).
 *
 * Each circle is shown by what it's reading, because that's how you'd pick
 * one: the book first, then the people.
 */
export default async function DiscoverPage() {
  const user = await requireUser();
  const { circles, books } = await getDiscover(user.id);

  return (
    <>
      <AppHeader user={user}>
        <AppNav active="discover" />
      </AppHeader>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        <header className="border-b border-ink-800 pb-8">
          <p className="plate-label">Public circles</p>
          <h1 className="cover-title mt-4 max-w-[16ch] text-[length:clamp(2.2rem,5.6vw,4rem)] text-ink-100">
            Find a circle reading something good.
          </h1>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-400 sm:text-lg">
            Small groups, real books, people reading with intent — not an
            audience. Circles open up only when every member votes to, so this
            shelf fills slowly, on purpose.
          </p>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <section aria-labelledby="forming" className="min-w-0">
            <SectionHead id="forming" title="Circles you can join" />
            {circles.length === 0 ? (
              <div className="mt-3 border-y border-ink-800 py-8">
                <p className="cover-label text-xl font-bold text-ink-100">No public circles yet.</p>
                <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-400">
                  Every circle starts private. Start your own with two or three
                  friends — if you all decide to, it can open up later.
                </p>
                <Link
                  href="/circles"
                  className="cover-label mt-5 inline-flex rounded-[3px] bg-series px-4 py-2.5 text-sm font-bold text-series-ink"
                >
                  Go to your circles
                </Link>
              </div>
            ) : (
              <ul className="mt-3 border-t border-ink-800">
                {circles.map((c) => (
                  <li key={c.slug} className="flex gap-5 border-b border-ink-800 py-6">
                    {c.book ? (
                      <BookCover title={c.book.title} author={c.book.author} width={72} />
                    ) : (
                      <div className="grid h-[108px] w-[72px] shrink-0 place-items-center border border-dashed border-ink-700 text-center text-2xs text-ink-500">
                        No book yet
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                        <div className="min-w-0">
                          <h3 className="cover-label text-xl font-bold leading-tight text-ink-100">{c.name}</h3>
                          {c.book && (
                            <p className="mt-1 text-sm text-ink-400">
                              Reading <span className="text-ink-200">{c.book.title}</span>
                              {c.book.author && <> by {c.book.author}</>}
                            </p>
                          )}
                        </div>
                        <JoinButton slug={c.slug} joined={c.joined} />
                      </div>
                      {c.tagline && (
                        <p className="mt-3 max-w-[56ch] font-prose text-base italic leading-relaxed text-ink-300">
                          {c.tagline}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2.5">
                        <div className="flex -space-x-1.5">
                          {c.avatars.map((a, i) => (
                            <Avatar key={i} name={a.name} color={a.color} size={22} className="ring-2 ring-ink-950" />
                          ))}
                        </div>
                        <span className="fig text-xs text-ink-500">
                          {c.memberCount} {c.memberCount === 1 ? "reader" : "readers"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside aria-labelledby="argued" className="min-w-0">
            <SectionHead id="argued" title="Most argued-about books" />
            {books.length === 0 ? (
              <p className="mt-3 border-y border-ink-800 py-4 text-sm leading-relaxed text-ink-400">
                Nothing yet. As public circles highlight passages, the books
                people actually argue about rise here.
              </p>
            ) : (
              <ol className="mt-3 border-t border-ink-800">
                {books.map((b, i) => (
                  <li key={b.id} className="border-b border-ink-800">
                    <Link href={`/circles/${b.circleSlug}`} className="group flex items-center gap-3 py-3">
                      <span className="fig cover-label w-5 text-right text-sm font-bold text-ink-500">{i + 1}</span>
                      <BookCover title={b.title} author={b.author} width={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-100 group-hover:underline">
                          {b.title}
                        </span>
                        <span className="block truncate text-xs text-ink-500">{b.circleName}</span>
                      </span>
                      <span className="fig shrink-0 text-right text-xs leading-tight text-ink-400">
                        {b.highlights}
                        <span className="block text-2xs text-ink-500">
                          {b.highlights === 1 ? "highlight" : "highlights"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
