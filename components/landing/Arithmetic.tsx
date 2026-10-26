"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * The arithmetic of an evening. Modernized with rounded container and luminous metrics.
 */
export function Arithmetic() {
  return (
    <section
      aria-label="What twenty minutes a night adds up to"
      className="mx-3 sm:mx-8 my-16 rounded-[2.5rem] sm:rounded-[3.5rem] bg-series text-series-ink shadow-2xl overflow-hidden relative"
    >
      {/* Subtle top curve highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30"
      />

      <div className="mx-auto max-w-[88rem] px-6 py-20 sm:px-12 sm:py-28">
        <p className="cover-title max-w-[24ch] text-[clamp(2.1rem,5vw,4.5rem)] leading-[1.05]">
          Twenty minutes after dinner is <Counter to={121} /> hours a year. That&apos;s
          about <Counter to={20} /> books — read with people who&apos;ll ask what you
          thought.
        </p>
        <p className="fig mt-10 max-w-[60ch] border-t border-series-ink/20 pt-4 text-sm leading-relaxed opacity-90">
          20 min × 365 nights = 121.7 hours. At 250 words a minute and roughly
          90,000 words a book, that&apos;s 20.3 books.
        </p>
      </div>
    </section>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!reduce && !inView) setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <span
      ref={ref}
      style={{ minWidth: `${String(to).length * 0.62}em` }}
      className="fig inline-block border-b-[0.08em] border-series-ink text-right font-black"
    >
      {value}
    </span>
  );
}
