"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Same thumb, same hour, different ending.
 *
 * One geometry does all the work: a series-colour band rises through the
 * picture like a page being turned upward. Below it, the night — a feed at
 * 9:40pm. Above it, the same evening spent with friends inside a book. The
 * clock never changes; only what the hour turns into does.
 */
export function SameHour() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // 0 → 0.15 hold on night, 0.15 → 0.8 the band rises, then hold on day.
  const edge = useTransform(scrollYProgress, [0.15, 0.8], [100, 0], { clamp: true });
  const clip = useMotionTemplate`inset(${edge}% 0 0 0)`;
  const bandTop = useMotionTemplate`${edge}%`;
  const nightScale = useTransform(scrollYProgress, [0, 0.8], reduce ? [1, 1] : [1.04, 1.16]);
  const dayScale = useTransform(scrollYProgress, [0.15, 1], reduce ? [1, 1] : [1.14, 1]);

  const [day, setDay] = useState(false);
  useMotionValueEvent(edge, "change", (v) => setDay(v < 50));

  return (
    <section
      id="same-hour"
      ref={ref}
      aria-label="Same hour, different ending"
      className="paperback relative h-[260vh]"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[88rem] items-center gap-8 px-4 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* The words: one clock, two endings. */}
          <div className="order-2 lg:order-1">
            <p className="cover-title fig text-[clamp(4rem,13vw,9rem)] leading-none text-cover-ink">
              9:40<span className="ml-2 align-top text-[0.32em] font-bold tracking-normal">PM</span>
            </p>
            <div className="relative mt-5 min-h-[9.5rem] sm:min-h-[8rem]" aria-live="polite">
              <Ending show={!day}>
                <span className="block text-cover-ink-soft">An hour into the feed.</span>
                You couldn&apos;t name three things you saw.
              </Ending>
              <Ending show={day}>
                <span className="block text-cover-ink-soft">Same thumb. Same hour.</span>
                Page 112 — and Maya just answered you in the margin.
              </Ending>
            </div>
          </div>

          {/* The picture: night underneath, day rising over it. */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto aspect-square w-full max-w-[min(36rem,52svh)] overflow-hidden bg-cover-paper-2 lg:max-w-[min(40rem,78svh)]">
              <motion.div style={{ scale: nightScale }} className="absolute inset-0">
                <Image
                  src="/avatar_scrolling.png"
                  alt="Late at night, a young man hunches in an armchair, lit by his phone."
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </motion.div>
              <motion.div style={{ clipPath: clip }} className="absolute inset-0">
                <motion.div style={{ scale: dayScale }} className="absolute inset-0">
                  <Image
                    src="/avatar_innovating.png"
                    alt="In daylight, two friends share a book and the idea it gave them."
                    fill
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
              {/* The band riding the boundary. */}
              <motion.div
                aria-hidden="true"
                style={{ top: bandTop }}
                className="absolute inset-x-0 h-3 -translate-y-1/2 bg-series shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
              />
              <span className="cover-label absolute left-3 top-3 bg-cover-paper/90 px-2 py-1 text-xs uppercase tracking-[0.14em] text-cover-ink">
                {day ? "With a circle" : "On the feed"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ending({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.p
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10, filter: show ? "blur(0px)" : "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      aria-hidden={!show}
      className="absolute inset-x-0 top-0 max-w-[28ch] text-2xl font-semibold leading-snug text-cover-ink sm:text-3xl"
    >
      {children}
    </motion.p>
  );
}
