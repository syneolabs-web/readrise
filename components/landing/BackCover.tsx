import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ColophonMark } from "./Colophon";
import { InviteField } from "./InviteField";

/**
 * The back cover: the close. Printed whole in the series colour, with the two
 * real actions again, then the colophon line a paperback ends on.
 */
export function BackCover() {
  return (
    <footer className="bg-series text-series-ink">
      <div className="mx-auto max-w-[88rem] px-4 pb-10 pt-24 sm:px-8 sm:pt-32">
        <h2 className="cover-title max-w-[18ch] text-[clamp(2.6rem,7.4vw,6rem)]">
          Your circle&apos;s first book is one invite away.
        </h2>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed opacity-90 sm:text-xl">
          Start a circle, upload a book, send the link to two friends. Tonight
          can be page one.
        </p>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end">
          <Link
            href="/signup"
            className="cover-label group inline-flex w-fit items-center gap-3 bg-series-ink px-7 py-4 text-lg font-bold text-series transition-transform duration-[140ms] active:scale-[0.97]"
          >
            Start a circle
            <ArrowRight
              size={20}
              strokeWidth={2.25}
              aria-hidden="true"
              className="transition-transform duration-[240ms] ease-[var(--ease-out)] group-hover:translate-x-1"
            />
          </Link>
          <InviteField tone="band" />
        </div>

        <div className="mt-24 flex flex-col gap-6 border-t border-series-ink/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ColophonMark className="h-9 w-auto" title="Readrise" />
            <p className="cover-label text-sm">
              <span className="font-bold">Readrise</span> · Read together · Argue in the margins · Keep what mattered
            </p>
          </div>
          <nav aria-label="Footer" className="cover-label flex gap-5 text-sm font-semibold">
            <Link href="/login" className="underline-offset-4 hover:underline">Sign in</Link>
            <Link href="/signup" className="underline-offset-4 hover:underline">Create an account</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
