import { SmoothScroll } from "@/components/SmoothScroll";

/**
 * Smooth scrolling belongs to the landing page, and only there.
 *
 * It was mounted in the root layout, so lenis hijacked scrolling on every
 * signed-in page as well. That is where it caused trouble: the reader is
 * `h-screen overflow-hidden`, so while it is open lenis has a document with
 * nothing to scroll. Navigating back to a circle client-side then leaves lenis
 * holding stale dimensions for a page that is suddenly tall again — scroll
 * position and height disagree, and the page reads as broken.
 *
 * The marketing story is the only place the effect is wanted, and scoping it
 * here also keeps the lenis bundle out of the app entirely. App pages get
 * native scrolling, which is what a phone should have had all along.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
