"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, BookOpen, ShieldCheck, Sparkles, Users } from "lucide-react";
import { ColophonMark, Wordmark } from "./Colophon";
import { InviteField } from "./InviteField";
import { SeriesPicker } from "./SeriesPicker";

/**
 * Modernized Cover: Supreme, curved, tactile UI with floating pill navigation,
 * double-bezel photo frame, luminous organic highlight, and atmospheric depth.
 * Calibrated viewport scaling: fits in register on any standard laptop without zooming.
 */
export function Cover() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const picY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 60]);
  const picScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.05]);
  const noteY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -30]);

  return (
    <section ref={ref} className="paperback relative flex min-h-[100svh] flex-col justify-between overflow-hidden">
      {/* ── Ambient radiant atmospheric lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[30rem] w-[60rem] rounded-full bg-series/10 blur-[120px] dark:bg-series/15"
      />

      {/* ── Top Floating Island Navbar */}
      <header className="relative z-30 mx-auto w-full max-w-[82rem] px-4 pt-3 sm:px-6 sm:pt-4">
        <nav
          aria-label="Main"
          className="anim-band-down flex items-center justify-between gap-4 rounded-full border border-cover-rule/50 bg-cover-paper/85 px-4 py-2 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.05)] backdrop-blur-2xl transition-all dark:bg-ink-900/85 sm:px-5 sm:py-2.5"
        >
          <Link href="/" aria-label="Readrise home" className="group rounded-full transition-opacity hover:opacity-90">
            <Wordmark />
          </Link>

          {/* Middle status pill */}
          <div className="hidden items-center gap-2 rounded-full border border-cover-rule/40 bg-cover-paper-2/60 px-3 py-0.5 text-2xs font-medium text-cover-ink-soft lg:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-series opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-series" />
            </span>
            <span className="cover-label text-[0.68rem] tracking-wider uppercase">
              A private reading circle for close friends
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <SeriesPicker />
            <Link
              href="/login"
              className="cover-label rounded-full px-3 py-1.5 text-xs font-semibold text-cover-ink transition-colors hover:bg-cover-ink/10 dark:hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="cover-label hidden rounded-full bg-series px-3.5 py-1.5 text-xs font-bold text-series-ink shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
            >
              Start circle
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Main Hero Canvas */}
      <div className="relative z-10 mx-auto grid w-full max-w-[82rem] flex-1 items-center gap-8 px-4 py-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:py-6">
        {/* Left Column: Typography & CTAs */}
        <div>
          {/* Eyebrow badge */}
          <div className="anim-soft-in mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-series/30 bg-series/10 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-series shadow-xs">
            <Sparkles size={12} className="shrink-0" />
            <span>The Anti-Feed Reading Circle</span>
          </div>

          {/* Title */}
          <h1 className="cover-title text-[length:clamp(2.3rem,5.2vw,3.9rem)] leading-[0.96] text-cover-ink">
            <span className="block overflow-hidden pb-[0.05em]">
              <span className="anim-line-rise block" style={{ animationDelay: "200ms" }}>
                Read together.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.05em]">
              <span className="anim-line-rise block" style={{ animationDelay: "340ms" }}>
                Rise{" "}
                {/* Organic curved highlight pill */}
                <span className="relative inline-block px-3 py-0.5 rounded-xl bg-series/20 dark:bg-series/30 border border-series/40 text-cover-ink shadow-[0_0_20px_rgba(255,94,54,0.2)]">
                  <span
                    aria-hidden="true"
                    className="anim-highlight absolute inset-0 rounded-xl bg-series/25"
                    style={{ animationDelay: "850ms" }}
                  />
                  <span className="relative z-10">together.</span>
                </span>
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="anim-soft-in mt-3.5 max-w-[32rem] text-sm leading-relaxed text-cover-ink-soft sm:text-base"
            style={{ animationDelay: "500ms" }}
          >
            Pick one book with two or three friends. Highlight the line that
            hits you, argue about it in the margin, turn the best idea into a
            habit — and keep everything worth keeping.
          </p>

          {/* Action Row */}
          <div
            className="anim-soft-in mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5"
            style={{ animationDelay: "680ms" }}
          >
            <div>
              <Link
                href="/signup"
                className="cover-label group inline-flex items-center gap-2.5 rounded-full bg-series px-6 py-3 text-sm font-bold text-series-ink shadow-[0_8px_20px_-4px_var(--series)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
              >
                <span>Start a circle</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-series-ink/15 transition-transform duration-200 group-hover:translate-x-1 dark:bg-white/20">
                  <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
                </span>
              </Link>
              <p className="mt-1.5 pl-2 text-2xs text-cover-ink-soft">Free. Bring any PDF.</p>
            </div>
            <div className="w-full max-w-xs">
              <InviteField />
            </div>
          </div>

          {/* Modern Trust Micro-Pills */}
          <div
            className="anim-soft-in mt-6 flex flex-wrap items-center gap-4 border-t border-cover-rule/40 pt-3.5 text-2xs text-cover-ink-soft"
            style={{ animationDelay: "800ms" }}
          >
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck size={13} className="text-series" />
              Private by default
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Users size={13} className="text-series" />
              2–5 close friends
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <BookOpen size={13} className="text-series" />
              No endless feeds
            </span>
          </div>
        </div>

        {/* Right Column: Hero Visual Double-Bezel Frame */}
        <div className="relative mx-auto w-full max-w-[32rem] lg:max-w-none">
          {/* Subtle warm halo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[2.5rem] bg-series/15 blur-xl transition-opacity duration-700"
          />

          {/* Outer Shell Container (Double Bezel) */}
          <div
            className="anim-picture-in relative rounded-[2rem] border border-black/5 bg-gradient-to-b from-white/90 via-white/50 to-white/20 p-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-500 dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-transparent dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] sm:p-3.5"
            style={{ animationDelay: "150ms" }}
          >
            {/* Inner Core */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[calc(2rem-0.6rem)] bg-cover-paper-2 shadow-inner group">
              <motion.div style={{ y: picY, scale: picScale }} className="absolute inset-0">
                <Image
                  src="/hero_reading_circle.webp"
                  alt="Three friends reading together; sharing an open book and tablet with highlighted lines."
                  fill
                  priority
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  className="object-cover object-[50%_35%] transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </motion.div>
            </div>
          </div>

          {/* Floating Glass Margin Note */}
          <motion.figure
            style={{ y: noteY }}
            className="absolute -bottom-6 left-2 w-[min(18rem,88%)] sm:-left-4 lg:-left-8 z-20"
          >
            <div
              className="anim-note-in rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-[0_15px_35px_-8px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all duration-300 hover:rotate-0 hover:scale-[1.02] dark:border-white/15 dark:bg-[#1C1814]/95 sm:p-4"
              style={{ animationDelay: "950ms" }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-series/15 px-2 py-0.5 text-3xs font-bold uppercase tracking-wider text-series">
                  <span className="h-1.5 w-1.5 rounded-full bg-series" />
                  Margin note
                </span>
                <span className="text-3xs font-medium text-cover-ink-soft">Walden, p. 112</span>
              </div>

              <blockquote className="font-prose text-xs leading-snug text-cover-ink">
                <mark className="rounded-md bg-series/25 px-1.5 py-0.5 font-medium text-cover-ink dark:bg-series/35">
                  Our life is frittered away by detail.
                </mark>
              </blockquote>

              <figcaption className="mt-2.5 flex items-start gap-2.5 border-t border-cover-rule/40 pt-2">
                <span
                  aria-hidden="true"
                  className="cover-label grid h-6 w-6 shrink-0 place-items-center rounded-full bg-series-cerise text-3xs font-bold text-white shadow-xs"
                >
                  M
                </span>
                <span className="text-xs leading-snug text-cover-ink-soft">
                  <b className="font-semibold text-cover-ink">Maya</b>
                  <br />
                  “This is my screen-time report in one sentence.”
                </span>
              </figcaption>
            </div>
          </motion.figure>
        </div>
      </div>

      {/* ── Bottom Floating Dock / Transition Bar */}
      <div className="anim-band-up relative z-20 mx-auto my-3 w-full max-w-3xl px-4" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between gap-4 rounded-full border border-cover-rule/50 bg-cover-paper/85 px-5 py-2 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all dark:bg-ink-900/85">
          <p className="cover-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cover-ink-soft">
            Price: twenty minutes an evening
          </p>
          <ColophonMark className="hidden h-5 w-auto text-series sm:block" title="" />
          <a
            href="#same-hour"
            className="cover-label inline-flex items-center gap-1.5 rounded-full bg-series/10 px-3.5 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-series transition-all hover:bg-series/20 hover:scale-105 active:scale-95"
          >
            <span>Open the story</span>
            <ArrowDown size={13} strokeWidth={2.5} aria-hidden="true" className="animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
