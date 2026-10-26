import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ColophonMark } from "./Colophon";
import { InviteField } from "./InviteField";

/**
 * Modernized BackCover: Architectural rounded-t close with high-contrast pill actions.
 */
export function BackCover() {
  return (
    <footer className="relative mt-16 sm:mt-24 rounded-t-[3rem] sm:rounded-t-[4rem] bg-series text-series-ink shadow-2xl overflow-hidden">
      {/* Subtle ambient light on the curve */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25"
      />

      <div className="mx-auto max-w-[88rem] px-4 pb-12 pt-20 sm:px-8 sm:pt-28">
        <h2 className="cover-title max-w-[18ch] text-[clamp(2.6rem,7.4vw,5.5rem)] leading-[0.98]">
          Your circle&apos;s first book is one invite away.
        </h2>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed opacity-90 sm:text-xl">
          Start a circle, upload a book, send the link to two friends. Tonight
          can be page one.
        </p>

        <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-end">
          <Link
            href="/signup"
            className="cover-label group inline-flex w-fit items-center gap-3.5 rounded-full bg-series-ink px-8 py-4.5 text-base sm:text-lg font-bold text-series shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
          >
            <span>Start a circle</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-series/20 transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
            </span>
          </Link>
          <div className="w-full max-w-sm">
            <InviteField tone="band" />
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-series-ink/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ColophonMark className="h-8 w-auto" title="Readrise" />
            <p className="cover-label text-xs sm:text-sm">
              <span className="font-bold">Readrise</span> · Read together · Argue in the margins · Keep what mattered
            </p>
          </div>
          <nav aria-label="Footer" className="cover-label flex gap-6 text-xs sm:text-sm font-semibold">
            <Link href="/login" className="underline-offset-4 hover:underline">Sign in</Link>
            <Link href="/signup" className="underline-offset-4 hover:underline">Create an account</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
