import Link from "next/link";
import { Avatar } from "@/components/ui";
import { BookCover } from "@/components/BookCover";
import { IconUsers, IconArrow, IconBookOpen, IconSparkles, IconPlus } from "@/components/icons";

type CircleMembership = {
  id: string;
  role: string;
  circle: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    isPublic: boolean;
    documents: { id: string; title: string; author: string | null }[];
    _count: { memberships: number; documents: number };
  };
};

type Props = {
  memberships: CircleMembership[];
};

export function ProfileCirclesGrid({ memberships }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <IconUsers size={16} />
          </div>
          <div>
            <h3 className="cover-label text-sm sm:text-base font-bold text-ink-100">
              Your Reading Circles
            </h3>
            <p className="text-3xs sm:text-xs text-ink-400">
              Circles where you read, discuss margin notes, and build collective vaults
            </p>
          </div>
        </div>

        <span className="rounded-full bg-ink-850 px-2.5 py-1 text-3xs font-semibold text-ink-300 border border-ink-800">
          {memberships.length} {memberships.length === 1 ? "Circle" : "Circles"} Joined
        </span>
      </div>

      {/* Grid */}
      {memberships.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-800 bg-ink-950/30 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-850 text-ink-400">
            <IconUsers size={20} />
          </div>
          <h4 className="cover-title mt-3 text-base font-bold text-ink-200">No circles joined yet</h4>
          <p className="mt-1 max-w-sm text-xs text-ink-400">
            Reading with close friends accelerates retention and makes every chapter unforgettable.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href="/circles"
              className="inline-flex items-center gap-2 rounded-full bg-series px-4 py-2 text-xs font-bold text-series-ink shadow-sm hover:brightness-105"
            >
              <IconPlus size={12} />
              <span>Create Circle</span>
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-4 py-2 text-xs font-semibold text-ink-200 hover:text-ink-100"
            >
              <span>Explore Public Pulse</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((m) => {
            const c = m.circle;
            const book = c.documents[0];
            const isOwner = m.role === "owner";

            return (
              <Link
                key={m.id}
                href={`/circles/${c.slug}`}
                prefetch={false}
                className="group relative flex flex-col justify-between rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-850/60 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="cover-label truncate text-sm font-bold text-ink-100 group-hover:text-accent transition-colors">
                      {c.name}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-4xs font-bold uppercase tracking-wider ${
                        isOwner
                          ? "bg-accent/15 text-accent border border-accent/20"
                          : "bg-ink-800 text-ink-400"
                      }`}
                    >
                      {isOwner ? "Owner" : "Member"}
                    </span>
                  </div>

                  {c.tagline ? (
                    <p className="mt-1 line-clamp-2 text-3xs text-ink-400">
                      {c.tagline}
                    </p>
                  ) : (
                    <p className="mt-1 text-3xs text-ink-500 italic">
                      Private reading room
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-ink-800/60 pt-3">
                  {book ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookCover title={book.title} author={book.author} width={30} />
                      <div className="min-w-0">
                        <span className="cover-label block truncate text-3xs font-bold text-ink-200">
                          {book.title}
                        </span>
                        <span className="block truncate text-4xs text-ink-500">
                          {book.author || "Current volume"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-3xs text-ink-500">
                      <IconBookOpen size={13} />
                      <span>No book uploaded</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-3xs font-semibold text-ink-400 group-hover:text-ink-100">
                    <span>Enter</span>
                    <IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
