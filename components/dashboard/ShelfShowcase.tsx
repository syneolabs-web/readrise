import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { IconPlus, IconCheck } from "@/components/icons";

type ShelfBook = {
  id: string;
  title: string;
  author: string | null;
  pageCount: number;
  page: number;
  touched: Date | null;
  circle: { name: string; slug: string };
};

type Props = {
  books: ShelfBook[];
  firstCircleSlug?: string;
};

export function ShelfShowcase({ books, firstCircleSlug }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-800/70 pb-2.5">
        <div>
          <h3 className="cover-label text-sm font-bold text-ink-100 sm:text-base">
            Shared Bookshelf
          </h3>
          <p className="text-xs text-ink-400">
            Volumes currently open across your reading circles
          </p>
        </div>

        <span className="rounded-full bg-ink-850 px-2.5 py-0.5 text-3xs font-semibold text-ink-300">
          {books.length} {books.length === 1 ? "Book" : "Books"} active
        </span>
      </div>

      {/* Grid of Books */}
      <div className="mt-3.5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        {books.slice(0, 7).map((b) => {
          const pct = b.pageCount ? Math.min(100, Math.round((b.page / b.pageCount) * 100)) : 0;
          const isDone = b.pageCount > 0 && b.page >= b.pageCount;

          return (
            <Link
              key={b.id}
              href={`/read/${b.id}`}
              prefetch={false}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-800/70 bg-ink-950/40 p-3 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-accent/40 hover:bg-ink-850/70 hover:shadow-xl hover:shadow-black/25"
            >
              {/* Subtle hover gradient wash */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Cover */}
              <div className="relative mx-auto flex w-fit items-center justify-center pt-1.5">
                <BookCover title={b.title} author={b.author} width={88} />
                {isDone && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-ink-950">
                    <IconCheck size={11} />
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="relative z-10 mt-3 min-w-0">
                <p className="truncate text-xs font-bold text-ink-100 group-hover:text-accent transition-colors">
                  {b.title}
                </p>
                <p className="truncate text-3xs text-ink-400 mt-0.5">
                  {b.author || "Unknown author"}
                </p>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-ink-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDone ? "bg-emerald-400" : "bg-accent"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-3xs text-ink-400 font-semibold">
                  <span className="truncate max-w-[85px]">{b.circle.name}</span>
                  <span className="font-mono">{isDone ? "Finished" : `p. ${b.page}/${b.pageCount || "?"}`}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Upload / Add Next Book Card */}
        {firstCircleSlug && (
          <Link
            href={`/circles/${firstCircleSlug}`}
            className="group flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-800 bg-ink-950/20 p-3 text-center transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:-translate-y-1"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-ink-800 bg-ink-900 text-ink-400 transition-all group-hover:border-accent group-hover:text-accent group-hover:scale-105 shadow-2xs">
              <IconPlus size={18} />
            </div>
            <p className="mt-2.5 text-xs font-bold text-ink-200 group-hover:text-ink-100">
              Add Next Book
            </p>
            <p className="mt-0.5 text-3xs leading-relaxed text-ink-500 max-w-[120px]">
              Upload a PDF to read with friends
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
