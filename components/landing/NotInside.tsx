"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * What's not inside — set like a back-cover list and struck through by hand,
 * one pen stroke per line as it scrolls into view. The strike is the series
 * colour; the words stay legible underneath, because the point is that you
 * recognise them.
 */
// Kept short enough to sit on one line each — the strike is one stroke, and a
// wrapped item would be struck through only half its words.
const STRUCK = ["The infinite feed", "Follower counts", "Ads", "Guilt trips"];

export function NotInside() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="not-inside-title" className="paperback py-24 sm:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 id="not-inside-title" className="cover-title text-[clamp(2.2rem,5vw,4rem)] text-cover-ink">
            What you won&apos;t find inside
          </h2>
          <p className="mt-5 max-w-[36ch] text-lg leading-relaxed text-cover-ink-soft">
            A book has a last page. So does an evening on Readrise. That&apos;s
            not a missing feature.
          </p>
        </div>

        <div>
          <ul>
            {STRUCK.map((s, i) => (
              <li key={s} className="border-b border-cover-rule py-3 first:pt-0 sm:py-4">
                <span className="relative inline-block">
                  <span className="cover-title whitespace-nowrap text-[length:clamp(1.6rem,4.4vw,3.6rem)] text-cover-ink-soft">
                    {s}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                    transition={{ duration: 0.55, delay: 0.15 + i * 0.12, ease: [0.77, 0, 0.175, 1] }}
                    className="absolute inset-x-[-0.15em] top-[52%] h-[0.14em] origin-left -rotate-[1.2deg] bg-series rounded-full shadow-[0_0_12px_var(--series)]"
                  />
                </span>
                <span className="sr-only"> — not included</span>
              </li>
            ))}
          </ul>
          <p className="cover-title mt-10 text-[clamp(1.8rem,4.4vw,3.6rem)] text-cover-ink">
            Just your friends, one book, and the margin between you.
          </p>
        </div>
      </div>
    </section>
  );
}
