"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * The arithmetic of an evening. Not a product metric — nothing here is about
 * Readrise's users — just what twenty minutes a night adds up to, with the
 * working shown underneath so the figure can be checked rather than trusted.
 * The whole region is printed in the series colour: after the dense demo, one
 * loud, quiet statement.
 */
export function Arithmetic() {
  return (
    <section aria-label="What twenty minutes a night adds up to" className="bg-series text-series-ink">
      <div className="mx-auto max-w-[88rem] px-4 py-24 sm:px-8 sm:py-36">
        <p className="cover-title max-w-[22ch] text-[clamp(2.1rem,5.6vw,4.9rem)]">
          Twenty minutes after dinner is <Counter to={121} /> hours a year. That&apos;s
          about <Counter to={20} /> books — read with people who&apos;ll ask what you
          thought.
        </p>
        <p className="fig mt-10 max-w-[60ch] border-t border-series-ink/30 pt-4 text-sm leading-relaxed opacity-85">
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
  // Server-render the true figure; only once hydrated (and still off-screen)
  // does it drop to zero to count up when reached.
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
      className="fig inline-block border-b-[0.08em] border-series-ink text-right"
    >
      {value}
    </span>
  );
}
