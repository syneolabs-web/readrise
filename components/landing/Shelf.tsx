"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ColophonMark } from "./Colophon";

/**
 * The shelf: four public-domain classics, each printed as a series paperback
 * in one of the four colours. Tap or hover a cover and it shows the line a
 * circle would most likely argue about. These are suggestions, not claims —
 * any PDF works, and the caption says so.
 */
const BOOKS = [
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    band: "bg-series-orange",
    ink: "text-[var(--series-orange-ink)]",
    line: "I declare after all there is no enjoyment like reading!",
    circle: "A first book for a circle that hasn't read since school",
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    band: "bg-series-blue",
    ink: "text-[var(--series-blue-ink)]",
    line: "Very little is needed to make a happy life.",
    circle: "Twelve short books — one a week, one habit each",
  },
  {
    title: "Walden",
    author: "Henry David Thoreau",
    band: "bg-series-green",
    ink: "text-[var(--series-green-ink)]",
    line: "Simplicity, simplicity, simplicity!",
    circle: "For the friend who keeps saying they'll delete the apps",
  },
  {
    title: "Self-Reliance",
    author: "Ralph Waldo Emerson",
    band: "bg-series-cerise",
    ink: "text-[var(--series-cerise-ink)]",
    line: "Trust thyself: every heart vibrates to that iron string.",
    circle: "One evening, one essay, a long argument after",
  },
] as const;

export function Shelf() {
  return (
    <section aria-labelledby="shelf-title" className="paperback border-t border-cover-rule py-24 sm:py-32">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 id="shelf-title" className="cover-title max-w-[16ch] text-[clamp(2.2rem,5.4vw,4.4rem)] text-cover-ink">
            Start with a classic. Or bring any PDF.
          </h2>
          <p className="max-w-[38ch] text-lg leading-relaxed text-cover-ink-soft">
            Your circle reads whatever you upload. These four are public domain,
            free, and very good at starting arguments.
          </p>
        </div>

        <ul className="-mx-4 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {BOOKS.map((b, i) => (
            <li key={b.title} className="w-[72vw] max-w-[20rem] shrink-0 snap-center sm:w-auto sm:max-w-none">
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
      initial={reduce ? false : { opacity: 0, y: 40, rotate: index % 2 ? 2 : -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay: index * 0.09, ease: [0.23, 1, 0.32, 1] }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-pressed={open}
        aria-label={`${book.title} by ${book.author}. ${open ? "Showing" : "Show"} a line worth discussing.`}
        className="group block w-full text-left [perspective:1200px]"
      >
        <span className="relative flex aspect-[2/3] flex-col overflow-hidden rounded-2xl bg-cover-paper shadow-[0_24px_45px_-20px_rgba(0,0,0,0.35),0_2px_8px_-2px_rgba(0,0,0,0.1)] ring-1 ring-black/10 transition-all duration-[400ms] ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:[transform:translateY(-10px)_rotateY(-6deg)_scale(1.02)] [@media(hover:hover)]:group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]">
          {/* spine shading on the left edge, as a real paperback has */}
          <span aria-hidden="true" className="absolute inset-y-0 left-0 z-10 w-2 bg-black/10" />

          <span className={`flex items-center justify-between px-4 pb-6 pt-4 ${book.band} ${book.ink}`}>
            <span className="cover-label text-[0.7rem] uppercase tracking-[0.16em]">Readrise</span>
            <ColophonMark className="h-5 w-auto" title="" />
          </span>

          <span className="relative flex flex-1 flex-col justify-center border-y-[3px] border-cover-paper bg-cover-paper px-4">
            <motion.span
              initial={false}
              animate={{ opacity: open ? 0 : 1, y: open ? -8 : 0 }}
              transition={{ duration: 0.3 }}
              className="block"
            >
              <span className="cover-title block text-[clamp(1.35rem,2.1vw,1.85rem)] text-cover-ink">{book.title}</span>
              <span className="mt-2 block text-sm text-cover-ink-soft">{book.author}</span>
            </motion.span>
            <motion.span
              initial={false}
              animate={{ opacity: open ? 1 : 0, y: open ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              aria-hidden={!open}
              className="absolute inset-x-4 top-1/2 block -translate-y-1/2"
            >
              <span className="block font-prose text-lg italic leading-snug text-cover-ink">“{book.line}”</span>
            </motion.span>
          </span>

          <span className={`px-4 pb-4 pt-6 ${book.band} ${book.ink}`}>
            <span className="block text-[0.8rem] leading-snug opacity-90">{book.circle}</span>
          </span>
        </span>
      </button>
    </motion.div>
  );
}
