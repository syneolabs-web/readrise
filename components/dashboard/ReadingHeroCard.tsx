import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { FriendsRail } from "@/components/FriendsRail";
import { IconArrow, IconBookOpen, IconAward, IconHighlighter, IconStarFilled } from "@/components/icons";
import { CircleActions } from "@/app/circles/CircleActions";

type BookItem = {
  id: string;
  title: string;
  author: string | null;
  pageCount: number;
  page: number;
  touched: Date | null;
  circle: {
    name: string;
    slug: string;
    memberships: { user: { id: string; name: string; avatarColor: string } }[];
  };
  doc: {
    id: string;
    title: string;
    author: string | null;
    pageCount: number;
    uploadedById: string;
    progress: { userId: string; currentPage: number; user: { id: string; name: string; avatarColor: string } }[];
  };
};

type Props = {
  current: BookItem | null;
  currentGoal: { headline: string; status: string } | null;
  user: { id: string; name: string };
  edition: string;
  friendsLineText: string;
  progress: {
    streak: number;
    insights: number;
    highlights: number;
    books: number;
  };
};

export function ReadingHeroCard({
  current,
  currentGoal,
  user,
  edition,
  friendsLineText,
  progress,
}: Props) {
  const firstName = user.name.split(" ")[0];

  if (!current) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-7 shadow-sm">
        {/* Subtle theme-reactive ambient glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Left Column: Heading & Actions */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-850 px-3 py-1 text-2xs font-semibold text-ink-300">
              <IconAward size={13} className="text-accent" />
              <span>Shelf Complete · All Books Finished</span>
            </div>

            <h1 className="cover-title mt-2.5 text-[length:clamp(1.7rem,3.8vw,2.7rem)] font-bold text-ink-100 leading-tight">
              Every book here is finished.{" "}
              <span className="not-italic text-accent font-serif italic">
                Pick the next one.
              </span>
            </h1>

            <p className="mt-2 max-w-[54ch] text-xs leading-relaxed text-ink-400 sm:text-sm">
              You&apos;ve completed every page across your circles. Drop a new PDF to start reading together tonight.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <CircleActions />
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850/80 px-4 py-2 text-xs font-semibold text-ink-300 hover:border-ink-500 hover:text-ink-100 transition-all"
              >
                <span>Explore Public Circles</span>
                <IconArrow size={12} />
              </Link>
            </div>
          </div>

          {/* Right Column: High-End Compact Stats Cluster */}
          <div className="flex sm:grid sm:grid-cols-3 lg:flex lg:flex-col gap-2.5 shrink-0 rounded-2xl border border-ink-800 bg-ink-950/60 p-3 sm:p-4 min-w-[210px]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <IconBookOpen size={15} />
              </div>
              <div>
                <span className="font-display text-base font-bold text-ink-100 leading-none">
                  {progress.books}
                </span>
                <p className="text-3xs text-ink-500 font-medium">{progress.books === 1 ? "Book" : "Books"} finished</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <IconHighlighter size={15} />
              </div>
              <div>
                <span className="font-display text-base font-bold text-ink-100 leading-none">
                  {progress.highlights}
                </span>
                <p className="text-3xs text-ink-500 font-medium">{progress.highlights === 1 ? "Highlight" : "Highlights"} kept</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <IconStarFilled size={15} />
              </div>
              <div>
                <span className="font-display text-base font-bold text-ink-100 leading-none">
                  {progress.insights}
                </span>
                <p className="text-3xs text-ink-500 font-medium">Vault insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentage for active reading
  const pct = current.pageCount ? Math.min(100, Math.round((current.page / current.pageCount) * 100)) : 0;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-7 shadow-sm">
      {/* Subtle theme-reactive ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />

      {/* Top Meta Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-850 px-3 py-1 text-2xs font-semibold text-ink-300">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>{edition}</span>
          <span className="text-ink-600">·</span>
          <span>{firstName}</span>
        </div>

        <Link
          href={`/circles/${current.circle.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-800 bg-ink-850 px-3 py-1 text-2xs font-semibold text-ink-300 hover:border-ink-600 hover:text-ink-100 transition-colors"
        >
          <span>Circle:</span>
          <span className="text-ink-100 font-bold">{current.circle.name}</span>
          <IconArrow size={11} className="text-ink-400" />
        </Link>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 mt-4 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <h1 className="cover-title text-[length:clamp(1.7rem,3.8vw,2.7rem)] font-bold text-ink-100 leading-tight">
            {current.page <= 1 ? "Tonight, start" : `Tonight, page ${current.page} of`}{" "}
            <span className="not-italic text-accent font-serif italic">
              {current.title}.
            </span>
          </h1>

          <p className="mt-2 max-w-[54ch] text-xs leading-relaxed text-ink-400 sm:text-sm">
            {currentGoal && currentGoal.status !== "done" ? currentGoal.headline : friendsLineText}
          </p>

          {/* Social companions in this book */}
          {current.circle.memberships.length > 1 && (
            <div className="mt-4 rounded-2xl border border-ink-800 bg-ink-950/60 p-2.5 max-w-xl">
              <p className="text-3xs font-bold uppercase tracking-wider text-ink-400 mb-1">
                Circle Reading Progress
              </p>
              <FriendsRail
                members={current.circle.memberships.map((m) => m.user)}
                progress={current.doc.progress}
                pageCount={current.pageCount}
                viewerId={user.id}
              />
            </div>
          )}

          {/* Action Row */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={`/read/${current.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-series px-5 py-2.5 text-xs font-bold text-series-ink shadow-md hover:brightness-105 transition-all duration-150 active:scale-[0.98]"
            >
              <IconBookOpen size={15} />
              <span>{current.page <= 1 ? "Start Reading" : "Continue Reading"}</span>
              <IconArrow size={13} />
            </Link>

            <Link
              href={`/circles/${current.circle.slug}`}
              className="inline-flex items-center rounded-full border border-ink-800 bg-ink-850 px-3.5 py-2 text-2xs font-semibold text-ink-300 hover:border-ink-600 hover:text-ink-100 transition-colors"
            >
              Circle Discussions
            </Link>
          </div>
        </div>

        {/* Right Side: Circular Gauge & 3D Cover */}
        <div className="flex flex-row items-center gap-4 lg:flex-col lg:items-end">
          <div className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-950/60 p-3 shadow-inner">
            <div className="relative flex items-center justify-center">
              <svg width="76" height="76" className="rotate-[-90deg]">
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-ink-800"
                  fill="transparent"
                />
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-accent transition-all duration-500 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-bold font-display text-ink-100">{pct}%</span>
                <span className="text-3xs uppercase tracking-wider text-ink-500 font-semibold">Done</span>
              </div>
            </div>

            <div className="min-w-0 pr-1">
              <p className="text-2xs font-bold text-ink-200">Reading Pace</p>
              <p className="mt-0.5 text-xs font-semibold text-ink-100 font-display">
                p. {current.page} <span className="text-ink-500">of</span> {current.pageCount || "?"}
              </p>
              <p className="mt-0.5 text-3xs text-ink-400">
                {current.pageCount ? `${Math.max(0, current.pageCount - current.page)} pages left` : ""}
              </p>
            </div>
          </div>

          <Link
            href={`/read/${current.id}`}
            aria-hidden="true"
            tabIndex={-1}
            className="group relative block transition-transform duration-150 hover:scale-105"
          >
            <BookCover title={current.title} author={current.author} width={95} />
          </Link>
        </div>
      </div>
    </div>
  );
}
