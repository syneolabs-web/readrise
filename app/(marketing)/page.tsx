/**
 * THESIS: The landing is a paperback you open. It refuses the category's
 * cream-and-serif "cosy books" page and its near-black neon opposite; the
 * world is a mid-century series paperback — flat colour bands, a paper band,
 * wide heavy grotesk titles, hairline rules, a colophon.
 *
 * OWN-WORLD: Four series colours (orange, blue, cerise, green) = the four
 * vibes, so the visitor's vibe reprints the cover. Archivo set wide and heavy
 * for titles, Literata only for what books say. Squared buttons, no gradients,
 * no glass; depth only from real offset shadows under paper objects.
 *
 * STORY: A visitor learns this is reading WITH friends, sees the loop work on
 * a real page (highlight → margin → habit → check-in → vault), and starts a
 * circle or types the invite code a friend sent.
 *
 * FIRST VIEWPORT: Series band with nav + cover picker; paper band with
 * "Read together. Rise together." (the word highlighted as it loads), both
 * actions; picture field with a friend's margin note pinned over it; a thin
 * series band at the foot.
 *
 * FORM: Grounded candidate 3 (the series paperback), seed 0adffe23.
 */
import { Cover } from "@/components/landing/Cover";
import { SameHour } from "@/components/landing/SameHour";
import { Loop } from "@/components/landing/Loop";
import { Shelf } from "@/components/landing/Shelf";
import { Arithmetic } from "@/components/landing/Arithmetic";
import { NotInside } from "@/components/landing/NotInside";
import { BackCover } from "@/components/landing/BackCover";
import { StickyBar } from "@/components/landing/StickyBar";

export default function Home() {
  return (
    <div className="paperback">
      <StickyBar />
      <main>
        <Cover />
        <SameHour />
        <Loop />
        <Arithmetic />
        <Shelf />
        <NotInside />
      </main>
      <BackCover />
    </div>
  );
}
