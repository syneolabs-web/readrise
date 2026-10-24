"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Wordmark } from "./Colophon";

/**
 * Once the cover has scrolled away, a slim running head keeps the primary
 * action one tap away — the way a book's running head keeps the title in
 * view. It leaves again at the back cover, which carries its own actions.
 */
export function StickyBar() {
  const { scrollY, scrollYProgress } = useScroll();
  const [show, setShow] = useState(false);

  const update = () => {
    const pastCover = scrollY.get() > window.innerHeight * 0.9;
    const atEnd = scrollYProgress.get() > 0.97;
    setShow(pastCover && !atEnd);
  };
  useMotionValueEvent(scrollY, "change", update);

  return (
    <AnimatePresence>
      {show && (
        <motion.header
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="paperback fixed inset-x-0 top-0 z-50 border-b border-cover-rule"
        >
          <div className="mx-auto flex max-w-[88rem] items-center justify-between px-4 py-2.5 sm:px-8">
            <Link href="/" aria-label="Readrise home" className="text-cover-ink">
              <Wordmark />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="cover-label hidden text-sm font-semibold text-cover-ink underline-offset-4 hover:underline sm:inline">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="cover-label bg-series px-4 py-2 text-sm font-bold text-series-ink transition-transform duration-[140ms] active:scale-[0.97]"
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
