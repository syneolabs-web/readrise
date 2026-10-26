"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Wordmark } from "./Colophon";

/**
 * Modernized StickyBar: A floating pill island that smoothly descends when scrolling.
 */
export function StickyBar() {
  const { scrollY, scrollYProgress } = useScroll();
  const [show, setShow] = useState(false);

  const update = () => {
    const pastCover = scrollY.get() > window.innerHeight * 0.7;
    const atEnd = scrollYProgress.get() > 0.95;
    setShow(pastCover && !atEnd);
  };
  useMotionValueEvent(scrollY, "change", update);

  return (
    <AnimatePresence>
      {show && (
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-x-0 top-4 z-50 pointer-events-none flex justify-center px-4"
        >
          <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between rounded-full border border-cover-rule/50 bg-cover-paper/85 px-5 py-2.5 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all dark:bg-ink-900/85 sm:px-6">
            <Link href="/" aria-label="Readrise home" className="text-cover-ink transition-opacity hover:opacity-90">
              <Wordmark />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="cover-label rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-cover-ink transition-colors hover:bg-cover-ink/10"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="cover-label rounded-full bg-series px-4 py-2 text-xs sm:text-sm font-bold text-series-ink shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              >
                Start a circle
              </Link>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
