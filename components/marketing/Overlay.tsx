"use client";

import { motion, MotionConfig, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { IconArrow, IconCheck, IconFlame, IconStarFilled } from "@/components/icons";
import { ReadriseLogo } from "@/components/marketing/ReadriseLogo";
import { ThemeMenu } from "@/components/ThemeMenu";

/**
 * The words of the story. Ten full-height chapters, timed to the acts of
 * StoryScene behind them (each chapter ≈ 10% of scroll):
 *
 *   0 hero · 1 the feed · 2 the interrupt · 3 the book · 4 the highlight
 *   5 the margin · 6 the circle · 7 the loop · 8 the vault · 9 the door
 *
 * Copy is the design material: second person, present tense, no feature
 * bullets until the reader has lived the arc. Every colour is a token
 * (ink/accent/grad) so the vibe × theme matrix applies mid-scroll (D13).
 */

const fadeUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.5 },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] as const },
};

function Chapter({
  children,
  align = "start",
  className = "",
}: {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const alignCls =
    align === "center"
      ? "items-center text-center"
      : align === "end"
        ? "items-end text-right"
        : "items-start text-left";
  return (
    <section
      className={`flex min-h-screen flex-col justify-center px-6 sm:px-16 lg:px-24 ${alignCls} ${className}`}
    >
      {children}
    </section>
  );
}

const eyebrowCls =
  "font-sans text-2xs font-semibold uppercase tracking-[0.22em] text-accent";
const hCls =
  "mt-4 max-w-[16ch] font-display font-light leading-[1.04] tracking-[-0.02em] text-ink-100 text-[clamp(2.4rem,6.5vw,4.6rem)] lining-nums";
const pCls = "mt-6 max-w-[46ch] font-prose text-lg leading-relaxed text-ink-300";

export function Overlay() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full">
        {/* reading progress — the landing is itself a page you read */}
        <motion.div
          className="bg-grad fixed inset-x-0 top-0 z-50 h-0.5 origin-left"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />

        <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5">
          <ReadriseLogo />
          <div className="flex items-center gap-2">
            <ThemeMenu />
            <Link
              href="/login"
              className="rounded-md border border-ink-700 px-3 py-1.5 text-xs font-medium text-ink-300 backdrop-blur-md transition-colors duration-[120ms] hover:bg-ink-800 hover:text-ink-100"
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* 0 — HERO */}
        <Chapter>
          <motion.p {...fadeUp} className={eyebrowCls}>
            A story you already know
          </motion.p>
          <motion.h1 {...fadeUp} className={hCls}>
            It&apos;s 11:47pm and the feed already knows how tonight goes.
          </motion.h1>
          <motion.p {...fadeUp} className={pCls}>
            You&apos;ve been here an hour. You couldn&apos;t name three things
            you saw.
          </motion.p>
          <motion.div
            {...fadeUp}
            className="mt-14 flex items-center gap-3 text-2xs uppercase tracking-[0.18em] text-ink-500"
          >
            <span className="bg-grad block h-8 w-px" aria-hidden="true" />
            Scroll — this one ends differently
          </motion.div>
        </Chapter>

        {/* 1 — THE FEED */}
        <Chapter align="end">
          <motion.p {...fadeUp} className={eyebrowCls}>
            Act I · The feed
          </motion.p>
          <motion.h2 {...fadeUp} className={hCls}>
            Two hours a day, every day, spent becoming no one in particular.
          </motion.h2>
          <motion.p {...fadeUp} className={pCls}>
            That&apos;s the average. Not because you&apos;re weak — because ten
            thousand engineers are paid to make the next flick land. It&apos;s
            not a moral failing. It&apos;s a design win. Someone else&apos;s.
          </motion.p>
        </Chapter>

        {/* 2 — THE INTERRUPT */}
        <Chapter align="center">
          <motion.h2
            {...fadeUp}
            className="max-w-[18ch] font-display text-[clamp(2.6rem,7vw,5.4rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink-100"
          >
            Same thumb. Same hour.
            <br />
            <span className="text-grad font-semibold">Different ending.</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mx-auto mt-6 max-w-[44ch] font-prose text-lg leading-relaxed text-ink-300">
            The urge to pick up the phone is not the enemy. It just needs
            somewhere better to land.
          </motion.p>
        </Chapter>

        {/* 3 — THE BOOK */}
        <Chapter>
          <motion.p {...fadeUp} className={eyebrowCls}>
            Act II · The page
          </motion.p>
          <motion.h2 {...fadeUp} className={hCls}>
            The phone opens. This time it&apos;s a book.
          </motion.h2>
          <motion.p {...fadeUp} className={pCls}>
            A real one — the same PDF for everyone in your circle, laid out on
            warm paper. It has a last page. That is not a missing feature.
          </motion.p>
        </Chapter>

        {/* 4 — THE HIGHLIGHT */}
        <Chapter align="end">
          <motion.p {...fadeUp} className={eyebrowCls}>
            The gesture
          </motion.p>
          <motion.h2 {...fadeUp} className={hCls}>
            A line reads you back. You mark it.
          </motion.h2>
          <motion.p {...fadeUp} className={pCls}>
            Select the sentence, one tap, done. The highlight lands on the exact
            words — at any zoom, on any screen, for every friend who opens the
            page after you.
          </motion.p>
        </Chapter>

        {/* 5 — THE MARGIN */}
        <Chapter>
          <motion.p {...fadeUp} className={eyebrowCls}>
            Act III · The margin
          </motion.p>
          <motion.h2 {...fadeUp} className={hCls}>
            By morning, someone has answered in the margin.
          </motion.h2>
          <motion.p {...fadeUp} className={pCls}>
            Not a like. A sentence, from a friend, anchored to the paragraph
            that caused it. The social urge — noticed, answered, aimed at
            something that lasts.
          </motion.p>
        </Chapter>

        {/* 6 — THE CIRCLE */}
        <Chapter align="center">
          <motion.p {...fadeUp} className={eyebrowCls}>
            Act IV · The circle
          </motion.p>
          <motion.h2
            {...fadeUp}
            className="max-w-[20ch] font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-light leading-[1.06] tracking-[-0.015em] text-ink-100"
          >
            Two or three people who notice whether you showed up.
          </motion.h2>
          <div className="mt-12 grid max-w-4xl gap-px overflow-hidden rounded-lg border border-ink-800 bg-ink-800 sm:grid-cols-3">
            {[
              {
                icon: <IconCheck size={15} />,
                title: "Commit",
                body: "One concrete habit per chapter, named out loud. Small enough to survive a bad day.",
              },
              {
                icon: <IconFlame size={15} />,
                title: "Check in",
                body: "Everyone marks it done, or doesn't. The streak belongs to the circle — miss, and it breaks for all of you.",
              },
              {
                icon: <IconStarFilled size={15} />,
                title: "Vault",
                body: "Pin what mattered. Searchable across every book you've read together, forever.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.2, 0, 0, 1] }}
                className="bg-ink-950/80 p-7 text-left backdrop-blur-sm"
              >
                <span className="inline-grid h-8 w-8 place-items-center rounded-md bg-accent/10 text-accent">
                  {step.icon}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </Chapter>

        {/* 7 — THE LOOP */}
        <Chapter>
          <motion.p {...fadeUp} className={eyebrowCls}>
            The honest part
          </motion.p>
          <motion.h2 {...fadeUp} className={hCls}>
            You can still lose two hours in here.
          </motion.h2>
          <motion.p {...fadeUp} className={pCls}>
            Chase the tangent. Argue about one paragraph until midnight.
            The difference is where it lands: you&apos;ll be two hours deeper
            into the book, with the margins to prove it.
          </motion.p>
          <motion.blockquote
            {...fadeUp}
            className="mt-10 max-w-md border-l-2 border-accent pl-5 font-prose text-xl italic leading-relaxed text-ink-200"
          >
            &ldquo;A reader lives a thousand lives before he dies. The man who
            never reads lives only one.&rdquo;
            <footer className="mt-3 font-sans text-2xs not-italic uppercase tracking-[0.18em] text-ink-500">
              George R.R. Martin
            </footer>
          </motion.blockquote>
        </Chapter>

        {/* 8 — THE VAULT / THE RISE */}
        <Chapter align="center">
          <motion.p {...fadeUp} className={eyebrowCls}>
            Act V · A year later
          </motion.p>
          <motion.h2
            {...fadeUp}
            className="max-w-[16ch] font-display text-[clamp(2.4rem,6.5vw,4.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink-100"
          >
            The scroll left nothing. The shelf is still here.
          </motion.h2>
          <motion.p {...fadeUp} className="mx-auto mt-6 max-w-[46ch] font-prose text-lg leading-relaxed text-ink-300">
            Every book finished together, every highlight worth keeping, every
            habit that stuck — one vault, built an evening at a time out of
            hours that used to vanish.
          </motion.p>
        </Chapter>

        {/* 9 — THE DOOR */}
        <Chapter align="center" className="pb-24">
          <motion.h2
            {...fadeUp}
            className="max-w-[16ch] font-display text-[clamp(2.6rem,7vw,5.2rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink-100"
          >
            Want to learn and grow?
            <br />
            <span className="text-grad font-semibold">Use this.</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mt-4 font-display text-xl font-light italic text-ink-500">
            Want to keep scrolling? You know the way back.
          </motion.p>
          <motion.div {...fadeUp} className="mt-12 flex flex-col items-center gap-4">
            <Link
              href="/login"
              className="bg-grad group inline-flex items-center gap-2.5 rounded-md px-7 py-3.5 text-sm font-semibold text-on-accent transition-[filter,transform] duration-[120ms] hover:brightness-110 active:scale-[0.98]"
            >
              Open a circle
              <IconArrow
                size={15}
                className="transition-transform duration-[120ms] group-hover:translate-x-0.5"
              />
            </Link>
            <span className="font-sans text-xs text-ink-600">
              Invite-only · No feed inside · The book ends, and that&apos;s the point
            </span>
          </motion.div>
        </Chapter>

        <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 pb-10 font-sans text-2xs text-ink-700 sm:px-16 lg:px-24">
          <span>Readrise</span>
          <span>Read together · Argue in the margins · Keep what mattered</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
