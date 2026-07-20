import { pickAvatarColor, truncate } from "@/lib/utils";

/**
 * A typographic book cover — a little cream "book" with the title in the
 * display serif and a coloured spine.
 *
 * The references lean on real cover art; our books are uploaded PDFs with no
 * artwork, so we render an honest typographic cover instead. It reuses the
 * paper material (the same cream as the reading surface), which makes each
 * card read as a tiny book — the "paper as material" identity carried into
 * the shelf. The spine colour is deterministic from the title, so a book keeps
 * the same identity everywhere it appears.
 */
export function BookCover({
  title,
  author,
  width = 52,
}: {
  title: string;
  author?: string | null;
  width?: number;
}) {
  const spine = pickAvatarColor(title);
  const height = Math.round(width * 1.4);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-sm bg-paper shadow-md shadow-black/40"
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* The spine. */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: spine }}
      />
      <div className="flex h-full flex-col justify-between py-2 pl-2.5 pr-1.5">
        <p
          className="font-display font-semibold leading-[1.05] text-paper-ink"
          style={{ fontSize: Math.max(7, width * 0.15) }}
        >
          {truncate(title, 42)}
        </p>
        {author && (
          <p
            className="font-prose italic leading-tight text-paper-ink/55"
            style={{ fontSize: Math.max(6, width * 0.11) }}
          >
            {truncate(author, 24)}
          </p>
        )}
      </div>
    </div>
  );
}
