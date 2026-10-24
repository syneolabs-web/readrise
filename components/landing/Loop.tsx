"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { Check, Pin } from "lucide-react";

/**
 * The loop, demonstrated rather than described.
 *
 * Left: a contents page — the loop's six steps as chapters, with dot leaders.
 * Right: one real page of Walden (public domain) on the reader's cream paper.
 * Scrolling turns the chapters, and each chapter does its thing ON the page:
 * the line gets highlighted, friends answer in the margin, a habit slip is
 * tucked in, the week gets checked off, the line is pinned to the vault.
 *
 * Every person and note here is illustrative — Maya, Dev and "you" are the
 * same demo circle the seed data uses.
 */
const CHAPTERS = [
  { n: "I", title: "Read", page: 1, body: "Everyone opens the same book. Your place is saved — and you can see roughly where your friends are." },
  { n: "II", title: "Highlight", page: 12, body: "Select a line. The mark lands on the exact words, at any zoom, on every friend's screen." },
  { n: "III", title: "Discuss", page: 27, body: "Friends answer in the margin, anchored to the sentence that started it. Not a like — a reply." },
  { n: "IV", title: "Commit", page: 41, body: "Each stretch of the book ends in one small habit the circle agrees to try." },
  { n: "V", title: "Check in", page: 58, body: "Tick it off each week. The streak belongs to the whole circle, so you show up for each other." },
  { n: "VI", title: "Keep", page: 73, body: "Pin what mattered to the vault — searchable across every book you've read together." },
] as const;

export function Loop() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStep(Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(p * CHAPTERS.length * 0.999))));
  });

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.offsetTop + (travel * (i + 0.5)) / CHAPTERS.length;
    if (lenis) lenis.scrollTo(top, { duration: reduce ? 0 : 1.1 });
    else window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section ref={ref} aria-labelledby="loop-title" className="paperback relative h-[520vh] border-t border-cover-rule">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[88rem] items-center gap-6 px-4 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Contents */}
          <div className="order-2 lg:order-1">
            {/* On phones the six-segment rule and chapter name below carry the
                heading's job; the page needs the height more. */}
            <h2 id="loop-title" className="cover-title text-[length:clamp(2rem,4.4vw,3.6rem)] text-cover-ink max-lg:sr-only">
              How a circle works
            </h2>

            {/* Desktop: the full contents page. */}
            <ol className="mt-8 hidden lg:block">
              {CHAPTERS.map((c, i) => {
                const on = i === step;
                const done = i < step;
                return (
                  <li key={c.n} className="border-b border-cover-rule last:border-b-0">
                    <button
                      onClick={() => goTo(i)}
                      aria-current={on ? "step" : undefined}
                      className="group w-full py-3 text-left"
                    >
                      <span className="flex items-baseline">
                        <span className={`cover-label fig w-10 text-sm ${on ? "text-cover-ink" : "text-cover-ink-soft"}`}>
                          {c.n}
                        </span>
                        <span
                          className={`cover-label text-xl font-bold transition-colors duration-[240ms] ${
                            on ? "text-cover-ink" : done ? "text-cover-ink-soft" : "text-cover-ink-soft/70 group-hover:text-cover-ink"
                          }`}
                        >
                          {c.title}
                        </span>
                        <span className="leader" aria-hidden="true" />
                        <span className={`fig text-sm ${on ? "text-cover-ink" : "text-cover-ink-soft"}`}>{c.page}</span>
                      </span>
                      <motion.span
                        initial={false}
                        animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="block overflow-hidden pl-10"
                      >
                        <span className="block max-w-[44ch] pb-1 pt-2 text-base leading-relaxed text-cover-ink-soft">
                          {c.body}
                        </span>
                      </motion.span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Phone: just the chapter you're on, and where it sits. */}
            <div className="mt-4 lg:hidden" aria-live="polite">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {CHAPTERS.map((c, i) => (
                  <span
                    key={c.n}
                    className={`h-1.5 flex-1 transition-colors duration-[240ms] ${i <= step ? "bg-series" : "bg-cover-rule"}`}
                  />
                ))}
              </div>
              <p className="cover-label mt-3 text-lg font-bold text-cover-ink">
                <span className="fig mr-2 text-cover-ink-soft">{CHAPTERS[step].n}</span>
                {CHAPTERS[step].title}
              </p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-cover-ink-soft">{CHAPTERS[step].body}</p>
            </div>
          </div>

          {/* The page */}
          <div className="order-1 lg:order-2">
            <PageStage step={step} />
          </div>
        </div>
      </div>
    </section>
  );
}

const EASE = [0.23, 1, 0.32, 1] as const;

/** Wide screens have a real margin, so layers accumulate; phones don't, so
 *  the margin notes and the habit slip take turns over the page. */
function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

function PageStage({ step }: { step: number }) {
  const reduce = useReducedMotion();
  const wide = useWide();
  const showNotes = wide ? step >= 2 && step < 5 : step === 2;
  const t = (d = 0) => ({ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : d, ease: EASE });

  return (
    // On wide screens the page leaves a real right margin for the notes to
    // land in, so they never cover the text they're answering.
    <div className="relative mx-auto w-full max-w-[40rem] lg:max-w-[48rem]">
      {/* The reader's page: cream paper, the product's real reading surface. */}
      <motion.div
        animate={{ opacity: step === 5 ? 0.5 : 1, scale: step === 5 ? 0.97 : 1 }}
        transition={t()}
        className="relative bg-paper px-6 py-7 text-paper-ink lg:w-[calc(100%-12rem)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] sm:px-10 sm:py-9"
      >
        <div className="flex items-baseline justify-between border-b border-paper-ink/15 pb-3">
          <span className="cover-label text-xs uppercase tracking-[0.14em] text-paper-ink/60">Walden · Where I Lived</span>
          <span className="fig text-xs text-paper-ink/60">p. 112</span>
        </div>

        <div className="mt-5 space-y-4 font-prose text-[0.98rem] leading-[1.7] sm:text-[1.05rem]">
          <p className="max-sm:hidden">
            I went to the woods because I wished to live deliberately, to front
            only the essential facts of life, and see if I could not learn what
            it had to teach, and not, when I came to die, discover that I had
            not lived.
          </p>
          <p>
            <span className="relative">
              {/* The highlight: drawn across the exact words, left to right. */}
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ scaleX: step >= 1 ? 1 : 0 }}
                transition={t(0.1)}
                className="absolute -inset-x-1 inset-y-0 origin-left bg-series/35"
              />
              <span className="relative">Our life is frittered away by detail.</span>
            </span>{" "}
            An honest man has hardly need to count more than his ten fingers, or
            in extreme cases he may add his ten toes, and lump the rest.
            Simplicity, simplicity, simplicity!
          </p>
        </div>

        {/* Where everyone is: one rail, three readers. */}
        <div className="mt-6 border-t border-paper-ink/15 pt-4">
          <div className="relative h-1.5 bg-paper-ink/10">
            <div className="absolute inset-y-0 left-0 w-[62%] bg-series" />
            {[
              { who: "D", at: 48, cls: "bg-series-green text-white" },
              { who: "You", at: 62, cls: "bg-paper-ink text-paper" },
              { who: "M", at: 71, cls: "bg-series-cerise text-white" },
            ].map((r) => (
              <span
                key={r.who}
                style={{ left: `${r.at}%` }}
                className={`cover-label absolute top-1/2 grid h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full px-1.5 text-[0.7rem] font-bold ring-2 ring-paper ${r.cls}`}
              >
                {r.who}
              </span>
            ))}
          </div>
          <p className="fig mt-3 text-xs text-paper-ink/60">You · p. 112 of 180 &nbsp;·&nbsp; Maya is ahead, Dev is catching up</p>
        </div>
      </motion.div>

      {/* III — the margin */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            key="margin"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={t()}
            className="absolute -right-2 top-[58%] w-[min(17rem,72%)] space-y-2 sm:-right-10 lg:right-0 lg:top-[24%] lg:w-[16rem]"
          >
            <Note initial="M" name="Maya" tone="bg-series-cerise">
              This is my screen-time report in one sentence.
            </Note>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(0.45)} className="pl-6">
              <Note initial="D" name="Dev" tone="bg-series-green">
                Okay. Phone in a drawer until 9 — who&apos;s in?
              </Note>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IV — the habit slip, tucked in like a bookmark */}
      <AnimatePresence>
        {step >= 3 && step < 5 && (
          <motion.div
            key="slip"
            initial={{ opacity: 0, y: 40, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -2.5 }}
            exit={{ opacity: 0, y: 40 }}
            transition={t()}
            className="absolute -left-2 bottom-6 w-[min(18rem,78%)] bg-series lg:bottom-auto lg:top-[calc(100%-1.75rem)] p-4 text-series-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] sm:-left-8"
          >
            <p className="cover-label text-xs uppercase tracking-[0.14em] opacity-80">This week&apos;s habit</p>
            <p className="cover-label mt-1.5 text-lg font-bold leading-tight">Phone in a drawer until 9pm, weeknights.</p>
            <p className="mt-1.5 text-sm opacity-85">Agreed by 3 of 3</p>

            {/* V — the check-in, written onto the slip */}
            <AnimatePresence>
              {step >= 4 && (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={t()}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex items-center gap-2 border-t border-series-ink/30 pt-3">
                    {["You", "M", "D"].map((w, i) => (
                      <motion.span
                        key={w}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ ...t(0.15 + i * 0.12), type: reduce ? "tween" : "spring", stiffness: 420, damping: 22 }}
                        className="cover-label inline-flex items-center gap-1 bg-series-ink px-2 py-1 text-xs font-bold text-series"
                      >
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                        {w}
                      </motion.span>
                    ))}
                    <span className="fig ml-auto text-sm font-semibold">Week 3</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VI — the vault */}
      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60 }}
            transition={t()}
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 border border-cover-rule bg-cover-paper p-5 text-cover-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:inset-x-10 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <p className="cover-label text-xs uppercase tracking-[0.14em] text-cover-ink-soft">The circle&apos;s vault</p>
              <Pin size={16} strokeWidth={1.75} aria-hidden="true" className="text-cover-ink-soft" />
            </div>
            <ul className="mt-3">
              <VaultRow quote="Our life is frittered away by detail." meta="Walden · pinned by Maya · habit kept 3 weeks" fresh />
              <VaultRow quote="Very little is needed to make a happy life." meta="Meditations · pinned by Dev" />
              <VaultRow quote="I declare after all there is no enjoyment like reading!" meta="Pride and Prejudice · pinned by you" />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Note({ initial, name, tone, children }: { initial: string; name: string; tone: string; children: React.ReactNode }) {
  return (
    <div className="border border-cover-rule bg-cover-paper p-3 text-cover-ink shadow-[0_14px_30px_-16px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`cover-label grid h-5 w-5 place-items-center rounded-full text-[0.68rem] font-bold text-white ${tone}`}>
          {initial}
        </span>
        <span className="text-sm font-semibold">{name}</span>
        <span className="ml-auto text-xs text-cover-ink-soft">in the margin</span>
      </div>
      <p className="mt-1.5 font-prose text-[0.92rem] leading-snug">{children}</p>
    </div>
  );
}

function VaultRow({ quote, meta, fresh = false }: { quote: string; meta: string; fresh?: boolean }) {
  return (
    <li className="ruled border-cover-rule py-3" style={{ borderColor: "var(--cover-rule)" }}>
      <p className="font-prose text-base leading-snug sm:text-lg">
        {fresh ? <mark className="bg-series/35 px-0.5 text-cover-ink">{quote}</mark> : quote}
      </p>
      <p className="mt-1 text-xs text-cover-ink-soft">{meta}</p>
    </li>
  );
}
