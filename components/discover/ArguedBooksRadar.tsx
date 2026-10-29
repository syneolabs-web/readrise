import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { IconFlame, IconHighlighter, IconArrow, IconBookOpen, IconSparkles } from "@/components/icons";

type ArguedBook = {
  id: string;
  title: string;
  author: string | null;
  highlights: number;
  circleSlug: string;
  circleName: string;
};

type Props = {
  books: ArguedBook[];
};

const STARTER_VOLUMES = [
  {
    title: "Thinking in Systems",
    author: "Donella H. Meadows",
    highlights: 42,
    tag: "Mental Models",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    highlights: 38,
    tag: "Craft & Focus",
  },
  {
    title: "The Compound Self",
    author: "James Clear",
    highlights: 29,
    tag: "Micro Habits",
  },
];

export function ArguedBooksRadar({ books }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-ink-800/70 pb-3.5">
        <div className="flex items-center gap-2">
          <IconFlame size={15} className="text-accent" />
          <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-300">
            Most Argued-About Books
          </h3>
        </div>
        <span className="text-3xs text-ink-500 font-semibold">
          Margin Radar
        </span>
      </div>

      {books.length === 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-3xs text-ink-400 leading-relaxed">
            As public circles annotate and debate in the margins, the books provoking the deepest discussion rise here.
          </p>

          <div className="border-t border-ink-800/60 pt-3">
            <span className="cover-label text-4xs font-bold uppercase tracking-widest text-ink-500 block mb-2.5">
              Ideal Pod Starter Books
            </span>

            <div className="space-y-2">
              {STARTER_VOLUMES.map((b, i) => (
                <div
                  key={b.title}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-ink-800/60 bg-ink-950/40 p-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-3xs font-bold text-ink-500 w-3">
                      {i + 1}
                    </span>
                    <BookCover title={b.title} author={b.author} width={30} />
                    <div className="min-w-0">
                      <span className="cover-label block truncate text-xs font-bold text-ink-200">
                        {b.title}
                      </span>
                      <span className="block truncate text-4xs text-ink-500">
                        {b.author}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 text-4xs font-bold text-accent">
                    {b.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-ink-800/60 text-center">
              <Link
                href="/circles"
                className="inline-flex items-center gap-1.5 text-3xs font-bold text-accent hover:underline"
              >
                <span>Upload a PDF & Start Pod</span>
                <IconArrow size={11} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ol className="mt-3.5 space-y-2">
          {books.map((b, i) => (
            <li key={b.id}>
              <Link
                href={`/circles/${b.circleSlug}`}
                className="group flex items-center gap-3 rounded-2xl border border-ink-800/70 bg-ink-950/40 p-2.5 transition-all duration-150 hover:border-ink-600 hover:bg-ink-850/60"
              >
                <span className="font-mono text-xs font-bold text-ink-500 w-4 text-center">
                  {i + 1}
                </span>

                <BookCover title={b.title} author={b.author} width={34} />

                <div className="min-w-0 flex-1">
                  <span className="cover-label block truncate text-xs font-bold text-ink-100 group-hover:text-accent transition-colors">
                    {b.title}
                  </span>
                  <span className="block truncate text-3xs text-ink-500">
                    {b.circleName}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1 text-3xs font-semibold text-accent">
                  <IconHighlighter size={12} />
                  <span>{b.highlights}</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
