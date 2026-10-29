"use client";

import Link from "next/link";
import { Wordmark } from "@/components/landing/Colophon";
import { ThemeMenu } from "@/components/ThemeMenu";
import { IconArrow, IconBack, IconBookOpen, IconSparkles } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-cover-paper text-cover-ink selection:bg-series selection:text-series-ink">
      {/* ── Ambient Radial Series Glow ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[34rem] w-[50rem] rounded-full bg-series/10 blur-[130px] dark:bg-series/15"
      />

      {/* ── Top Header Bar ── */}
      <header className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-6 sm:pt-8">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Readrise home"
            className="group rounded-full transition-opacity hover:opacity-90"
          >
            <Wordmark />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeMenu />
            <Link
              href="/circles"
              className="hidden rounded-full border border-cover-rule/50 bg-cover-paper-2/60 px-4 py-1.5 text-xs font-semibold text-cover-ink shadow-2xs backdrop-blur-md transition-all hover:border-accent hover:text-accent sm:inline-flex"
            >
              My Circles
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Central Hero Stage ── */}
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-2xl flex-col items-center px-6 py-12 text-center">
        {/* Folio Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-series/30 bg-series/10 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-series shadow-xs">
          <IconSparkles size={12} />
          <span>Lacuna &bull; Page Not Found</span>
        </div>

        {/* 404 Illuminated Folio Illustration */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Background Ambient Aura */}
          <div className="absolute h-32 w-32 rounded-full bg-series/20 blur-2xl" />

          {/* Sculptural Missing Folio Icon */}
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-cover-rule/60 bg-cover-paper-2/80 p-5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
            <svg viewBox="0 0 48 48" fill="none" className="h-16 w-16 text-series" aria-hidden="true">
              {/* Spine Gutter */}
              <path d="M24 10V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              {/* Left Page */}
              <path d="M24 10C17 7 10 7.5 6 9.5V36.5C10 34.5 17 34 24 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Right Page (Missing Leaf with dashed cut) */}
              <path d="M24 10C31 7 38 7.5 42 9.5V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M42 27V36.5C38 34.5 31 34 24 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              {/* Floating Lost Bookmark Ribbon */}
              <path d="M33 16V28L36.5 25L40 28V16" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              {/* Question / Lost Glyphs */}
              <circle cx="36.5" cy="11.5" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* Large Watermark Typography behind */}
          <span className="pointer-events-none absolute -z-10 font-display text-[9rem] sm:text-[12rem] font-black tracking-tighter text-cover-ink/[0.04] select-none leading-none">
            404
          </span>
        </div>

        {/* Headline */}
        <h1 className="cover-title text-[clamp(2rem,4vw,3.2rem)] text-cover-ink">
          This page was left unwritten.
        </h1>

        {/* Prose Description */}
        <p className="mt-4 max-w-md font-prose text-base leading-relaxed text-cover-ink-soft sm:text-lg">
          The volume you&apos;re looking for has been moved to another shelf, or was never bound into this edition.
          The margins here are quiet.
        </p>

        {/* Navigation CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/circles"
            className="inline-flex items-center gap-2 rounded-full bg-series px-6 py-2.5 text-sm font-bold text-series-ink shadow-md transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-95"
          >
            <IconBookOpen size={16} />
            <span>Return to Circles</span>
            <IconArrow size={14} />
          </Link>

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 rounded-full border border-cover-rule/60 bg-cover-paper-2/70 px-5 py-2.5 text-sm font-semibold text-cover-ink shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-cover-ink/30 hover:bg-cover-paper-2 active:scale-95"
          >
            <span>Browse Public Shelf</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-cover-ink-soft transition-colors hover:text-cover-ink"
          >
            <IconBack size={13} />
            <span>Readrise Home</span>
          </Link>
        </div>
      </main>

      {/* ── Quiet Footer Colophon ── */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-6 text-center text-3xs text-cover-ink-soft/75 sm:pb-8">
        <p>
          Readrise &bull; Synchronous Reading Pods &bull; Error 404 (Missing Folio)
        </p>
      </footer>
    </div>
  );
}
