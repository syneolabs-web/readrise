"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ColophonMark, Wordmark } from "./Colophon";
import { InviteField } from "./InviteField";
import { SeriesPicker } from "./SeriesPicker";

/**
 * The front cover. A paperback's horizontal grid: a series-colour band, the
 * paper band carrying the title, a picture field, a series-colour band.
 *
 * It has to do three jobs in one viewport: say what this is (a book you read
 * with friends), show the mechanism (a margin note pinned to a line), and put
 * both real actions — start a circle, or enter the code a friend sent — in
 * reach without a scroll.
 */
export function Cover() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Leaving the cover: the picture drifts slower than the page and settles in
  // closer, like a camera dollying in as the book is lifted.
  const picY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const picScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.12]);
  const noteY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);

  return (
    <section ref={ref} className="paperback relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* ── Top band */}
      <div className="anim-band-down bg-series text-series-ink">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-4 sm:px-8"
        >
          <Link href="/" aria-label="Readrise home" className="rounded-sm">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="hidden sm:block">
              <SeriesPicker />
            </div>
            <Link
              href="/login"
              className="cover-label rounded-sm px-2 py-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </nav>
        <div className="mx-auto flex max-w-[88rem] items-end justify-between gap-6 border-t border-series-ink/25 px-4 pb-3 pt-2.5 sm:px-8">
          <p className="cover-label text-xs uppercase tracking-[0.16em]">
            A reading circle for friends
          </p>
          <p className="cover-label hidden text-xs uppercase tracking-[0.16em] sm:block">
            Read · Highlight · Discuss · Commit · Check in · Keep
          </p>
          {/* On phones the picker drops to this row so the nav stays one line. */}
          <div className="sm:hidden">
            <SeriesPicker />
          </div>
        </div>
      </div>

      {/* ── Paper band */}
      <div className="relative mx-auto grid w-full max-w-[88rem] flex-1 items-center gap-10 px-4 pb-10 pt-10 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:pb-12 lg:pt-10">
        <div>
          <h1 className="cover-title text-[length:clamp(2.9rem,10.5vw,4rem)] text-cover-ink sm:whitespace-nowrap sm:text-[length:clamp(3.4rem,6.3vw,5.75rem)]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="anim-line-rise block" style={{ animationDelay: "250ms" }}>
                Read together.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="anim-line-rise block" style={{ animationDelay: "380ms" }}>
                Rise{" "}
                {/* The product's own gesture, performed on its own headline:
                    the word gets highlighted, stroke drawn left to right. */}
                <span className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="anim-highlight absolute -inset-x-[0.06em] bottom-[0.04em] h-[0.42em] bg-series"
                    style={{ animationDelay: "1050ms" }}
                  />
                  <span className="relative">together.</span>
                </span>
              </span>
            </span>
          </h1>

          <p
            className="anim-soft-in mt-6 max-w-[34rem] text-lg leading-relaxed text-cover-ink-soft sm:text-xl"
            style={{ animationDelay: "600ms" }}
          >
            Pick one book with two or three friends. Highlight the line that
            hits you, argue about it in the margin, turn the best idea into a
            habit — and keep everything worth keeping.
          </p>

          <div
            className="anim-soft-in mt-8 flex flex-col gap-7 sm:flex-row sm:items-end sm:gap-8"
            style={{ animationDelay: "760ms" }}
          >
            <div>
              <Link
                href="/signup"
                className="cover-label group inline-flex items-center gap-3 bg-cover-ink px-6 py-4 text-base font-bold text-cover-paper transition-transform duration-[140ms] active:scale-[0.97]"
              >
                Start a circle
                <ArrowRight
                  size={18}
                  strokeWidth={2.25}
                  aria-hidden="true"
                  className="transition-transform duration-[240ms] ease-[var(--ease-out)] group-hover:translate-x-1"
                />
              </Link>
              <p className="mt-2 text-sm text-cover-ink-soft">Free. Bring any PDF.</p>
            </div>
            <InviteField />
          </div>
        </div>

        {/* Picture field */}
        <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
          <div className="anim-picture-in relative aspect-[4/3.4] max-h-[62svh] w-full overflow-hidden bg-cover-paper-2" style={{ animationDelay: "150ms" }}>
            <motion.div style={{ y: picY, scale: picScale }} className="absolute inset-0">
              <Image
                src="/avatar_innovating.png"
                alt="Two friends in a library; one holds an open book and both light up over the same idea."
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="object-cover object-[50%_35%]"
              />
            </motion.div>
          </div>

          {/* The mechanism, on the cover: a line, and a friend's note pinned to it. */}
          <motion.figure
            style={{ y: noteY }}
            className="absolute -bottom-6 left-3 w-[min(19rem,84%)] sm:-left-8 lg:-left-14"
          >
            <div
              className="anim-note-in border border-cover-rule bg-cover-paper p-4 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]"
              style={{ animationDelay: "1250ms" }}
            >
              <blockquote className="font-prose text-[0.95rem] leading-snug text-cover-ink">
                <mark className="bg-series/30 px-0.5 text-cover-ink [box-decoration-break:clone]">
                  Our life is frittered away by detail.
                </mark>
              </blockquote>
              <figcaption className="mt-3 flex items-start gap-2.5 border-t border-cover-rule pt-3">
                <span
                  aria-hidden="true"
                  className="cover-label grid h-6 w-6 shrink-0 place-items-center rounded-full bg-series-cerise text-xs font-bold text-white"
                >
                  M
                </span>
                <span className="text-sm leading-snug text-cover-ink-soft">
                  <b className="font-semibold text-cover-ink">Maya</b> · Walden, p. 112
                  <br />
                  “This is my screen-time report in one sentence.”
                </span>
              </figcaption>
            </div>
          </motion.figure>
        </div>
      </div>

      {/* ── Bottom band */}
      <div className="anim-band-up bg-series text-series-ink" style={{ animationDelay: "100ms" }}>
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <p className="cover-label text-xs uppercase tracking-[0.16em]">
            Price: twenty minutes an evening
          </p>
          <ColophonMark className="hidden h-7 w-auto sm:block" title="" />
          <a
            href="#same-hour"
            className="cover-label inline-flex items-center gap-2 rounded-sm text-xs uppercase tracking-[0.16em] hover:underline"
          >
            Open it
            <ArrowDown size={14} strokeWidth={2} aria-hidden="true" className="motion-safe:animate-[scroll-hint_2.4s_var(--ease-in-out)_3]" />
          </a>
        </div>
      </div>

    </section>
  );
}
