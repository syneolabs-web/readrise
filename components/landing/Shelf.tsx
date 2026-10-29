"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ColophonMark } from "./Colophon";
import { IconArrow, IconBookOpen, IconSparkles } from "@/components/icons";

/**
 * The shelf: four public-domain classics, printed as heirloom series paperbacks.
 *
 * Each volume features:
 * - Bespoke literary typography & historical ornamental engraving motif
 * - Authentic 3D bookbinding physics: leather spine depth, embossed crease, deckle page block, silk bookmark ribbon
 * - Luminous foil sheen sweep and interactive quote reveal on hover
 * - Permanent rich book-ink contrast (#1b160f) on warm ivory stock (#fbf7ee) in all themes
 */
const BOOKS = [
  {
    title: "Pride and Prejudice",
    shortTitle: "Pride & Prejudice",
    author: "Jane Austen",
    year: "1813",
    vol: "VOL. 01",
    subtitle: "A Novel in Three Volumes",
    genre: "Regency Romance & Irony",
    band: "bg-series-orange",
    ribbon: "bg-amber-400",
    ink: "text-[var(--series-orange-ink)]",
    line: "I declare after all there is no enjoyment like reading!",
    circle: "A first book for a circle that hasn't read since school",
    badge: "Most Argued Romance",
    pages: "279 pp.",
    motif: "floral",
  },
  {
    title: "Meditations",
    shortTitle: "Meditations",
    author: "Marcus Aurelius",
    year: "c. 175 AD",
    vol: "VOL. 02",
    subtitle: "The Private Stoic Journal",
    genre: "Imperial Roman Philosophy",
    band: "bg-series-blue",
    ribbon: "bg-blue-400",
    ink: "text-[var(--series-blue-ink)]",
    line: "Very little is needed to make a happy life.",
    circle: "Twelve short books — one a week, one habit each",
    badge: "Mind & Discipline",
    pages: "152 pp.",
    motif: "stoic",
  },
  {
    title: "Walden",
    shortTitle: "Walden",
    author: "Henry David Thoreau",
    year: "1854",
    vol: "VOL. 03",
    subtitle: "Or, Life in the Woods",
    genre: "Solitude, Nature & Economy",
    band: "bg-series-green",
    ribbon: "bg-emerald-400",
    ink: "text-[var(--series-green-ink)]",
    line: "Simplicity, simplicity, simplicity!",
    circle: "For the friend who keeps saying they'll delete the apps",
    badge: "Deep Focus Classic",
    pages: "248 pp.",
    motif: "woodland",
  },
  {
    title: "Self-Reliance",
    shortTitle: "Self-Reliance",
    author: "Ralph Waldo Emerson",
    year: "1841",
    vol: "VOL. 04",
    subtitle: "Essays: First Series",
    genre: "Intellectual Nonconformity",
    band: "bg-series-cerise",
    ribbon: "bg-rose-400",
    ink: "text-[var(--series-cerise-ink)]",
    line: "Trust thyself: every heart vibrates to that iron string.",
    circle: "One evening, one essay, a long argument after",
    badge: "Courage & Originality",
    pages: "64 pp.",
    motif: "compass",
  },
] as const;

/** Bespoke engraving motifs for each classic edition */
function BookMotif({ type }: { type: string }) {
  if (type === "floral") {
    // Regency ivy & twin blossoms
    return (
      <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9 text-series-orange opacity-95 mx-auto" aria-hidden="true">
        <path d="M24 6C24 6 20 14 14 16C8 18 4 24 4 24C4 24 10 24 16 20C22 16 24 6 24 6Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M24 6C24 6 28 14 34 16C40 18 44 24 44 24C44 24 38 24 32 20C26 16 24 6 24 6Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
        <path d="M24 27V42M18 36C21 34 24 34 24 34M30 36C27 34 24 34 24 34" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "stoic") {
    // Roman imperial laurel wreath & column
    return (
      <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9 text-series-blue opacity-95 mx-auto" aria-hidden="true">
        <path d="M12 28C10 22 12 14 24 10C36 14 38 22 36 28" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 3" />
        <path d="M19 18V36M29 18V36M15 18H33M15 36H33" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="24" cy="7" r="2.5" fill="currentColor" />
      </svg>
    );
  }
  if (type === "woodland") {
    // Botanical pine branches & morning sun
    return (
      <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9 text-series-green opacity-95 mx-auto" aria-hidden="true">
        <circle cx="24" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.2" />
        <path d="M24 19L24 42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M24 25L14 31M24 25L34 31M24 31L12 38M24 31L36 38" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  // Guiding star compass
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9 text-series-cerise opacity-95 mx-auto" aria-hidden="true">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <path d="M24 4V44M4 24H44" stroke="currentColor" strokeWidth="1.2" />
      <polygon points="24,12 27,21 36,24 27,27 24,36 21,27 12,24 21,21" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function Shelf() {
  return (
    <section aria-labelledby="shelf-title" className="paperback border-t border-cover-rule py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-series/30 bg-series/10 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-series shadow-xs mb-3">
              <IconSparkles size={12} />
              <span>Archival Editions &bull; Synchronous Reading</span>
            </div>
            <h2 id="shelf-title" className="cover-title max-w-[16ch] text-[clamp(2.2rem,5.4vw,4.4rem)] text-cover-ink">
              Start with a classic. Or bring any PDF.
            </h2>
          </div>
          <p className="max-w-[38ch] text-lg leading-relaxed text-cover-ink-soft">
            Your circle reads whatever you upload. These four heirloom editions are public domain,
            free, and designed to ignite thoughtful margin debates.
          </p>
        </div>

        <ul className="-mx-4 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-12 pt-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {BOOKS.map((b, i) => (
            <li key={b.title} className="w-[74vw] max-w-[21rem] shrink-0 snap-center sm:w-auto sm:max-w-none">
              <Paperback book={b} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Paperback({ book, index }: { book: (typeof BOOKS)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, rotate: index % 2 ? 1.5 : -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay: index * 0.09, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="group relative block w-full text-left [perspective:1400px] cursor-pointer"
      >
        {/* ── Fanned Deckle Pages (Physical Book Thickness on Right Edge) ── */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1.5 -right-1 z-0 w-3 rounded-r-sm bg-[#f2e9d8] border-r border-[#dacab0] shadow-sm transition-transform duration-300 group-hover:translate-x-1"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-2.5 -right-2 z-[-1] w-3 rounded-r-sm bg-[#e8dcbf] border-r border-[#cbb795] transition-transform duration-300 group-hover:translate-x-2"
        />

        {/* ── Silk Ribbon Bookmark (Draped from Top Edge) ── */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-2 right-6 z-30 h-10 w-3.5 rounded-b-xs shadow-md transition-all duration-300 ease-out group-hover:h-12 group-hover:translate-y-1 ${book.ribbon}`}
        >
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/15" />
        </div>

        {/* ── Main Book Body ── */}
        <div className="relative flex aspect-[2/3] flex-col overflow-hidden rounded-2xl bg-[#fbf7ee] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.38),0_2px_8px_-2px_rgba(0,0,0,0.12)] ring-1 ring-black/15 transition-all duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:[transform:translateY(-14px)_rotateY(-8deg)_rotateX(4deg)_scale(1.025)] [@media(hover:hover)]:group-hover:shadow-[0_38px_70px_-15px_rgba(0,0,0,0.48),0_15px_30px_-5px_rgba(0,0,0,0.25)]">
          {/* Spine Depth & Fold Crease */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-20 w-4 bg-gradient-to-r from-black/35 via-black/12 to-transparent" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-2.5 z-20 w-px bg-white/25" />

          {/* Diagonal Reflective Foil Sheen Sweep on Hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-full z-40 bg-gradient-to-tr from-transparent via-white/22 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100"
          />

          {/* ── Top Series Archival Cloth Band ── */}
          <div className={`relative z-10 flex shrink-0 items-center justify-between px-5 pb-5 pt-4 ${book.band} ${book.ink} shadow-sm`}>
            <div className="flex flex-col">
              <span className="font-bold tracking-[0.2em] uppercase text-[0.68rem] opacity-95">Readrise Archive</span>
              <span className="font-mono text-[0.62rem] opacity-80">{book.vol}</span>
            </div>
            <ColophonMark className="h-5 w-auto opacity-95" title="" />
          </div>

          {/* ── Middle Archival Paper Canvas (Permanent Authentic Print Stock) ── */}
          <div className="relative flex flex-1 flex-col justify-between p-3.5 sm:p-4 bg-[#fbf7ee] overflow-hidden">
            {/* Ornate Debossed Blind-Stamp Framing Rule */}
            <div className="absolute inset-2.5 rounded-xl border border-[#4a3f2c]/20 pointer-events-none" />
            <div className="absolute inset-3 rounded-lg border border-dashed border-[#4a3f2c]/15 pointer-events-none" />

            {/* Standard Cover View (Visible when not hovered/tapped) */}
            <motion.div
              initial={false}
              animate={{ opacity: open ? 0 : 1, scale: open ? 0.95 : 1 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 flex h-full flex-col justify-between py-1 text-center"
            >
              <div className="pt-2">
                <BookMotif type={book.motif} />
                <span className="mt-2 block font-mono text-[0.65rem] uppercase tracking-wider text-[#6b5e4d]">
                  {book.year} &bull; {book.subtitle}
                </span>
              </div>

              <div className="px-2">
                <h3 className="font-prose text-[clamp(1.35rem,2vw,1.8rem)] font-semibold italic leading-tight text-[#1b160f]">
                  {book.title}
                </h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#524636]">
                  {book.author}
                </p>
              </div>

              <div className="pb-1">
                <span className="inline-block rounded-full border border-[#4a3f2c]/25 bg-[#eee4cb]/90 px-3 py-0.5 text-3xs font-semibold text-[#2c2419] shadow-2xs">
                  {book.genre}
                </span>
              </div>
            </motion.div>

            {/* Interactive Discussion Reveal View (Revealed smoothly on hover/tap) */}
            <motion.div
              initial={false}
              animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 1.05 }}
              transition={{ duration: 0.25 }}
              aria-hidden={!open}
              className="absolute inset-3 z-10 flex flex-col justify-between rounded-lg bg-[#f4ecdb] p-4 text-center shadow-inner border border-[#4a3f2c]/20"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-series/15 text-series px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider">
                  <IconBookOpen size={10} />
                  <span>{book.badge}</span>
                </span>

                <span className="block mt-2 text-2xl font-prose italic text-series leading-none">“</span>
                <p className="font-prose text-base italic leading-snug text-[#1b160f] -mt-1 line-clamp-4">
                  {book.line}
                </p>
              </div>

              <div className="pt-2 border-t border-[#4a3f2c]/20">
                <p className="text-3xs font-medium text-[#524636] leading-tight mb-2">
                  {book.circle}
                </p>
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-series px-3 py-1.5 text-xs font-bold text-series-ink shadow-xs transition-transform duration-150 hover:scale-[1.02] active:scale-95"
                >
                  <span>Start pod with this book</span>
                  <IconArrow size={12} />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* ── Foot Cloth Band ── */}
          <div className={`relative z-10 flex items-center justify-between px-4 pb-3.5 pt-3 ${book.band} ${book.ink}`}>
            <span className="text-[0.72rem] font-medium opacity-90 truncate max-w-[70%]">
              {book.circle}
            </span>
            <span className="font-mono text-3xs font-bold opacity-85 shrink-0">
              {book.pages}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
