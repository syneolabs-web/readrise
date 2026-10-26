import { Wordmark } from "@/components/landing/Colophon";

/**
 * The app's logo is the landing's colophon: the sun-over-an-open-book in an
 * oval cartouche, beside the wordmark, printed in whatever ink surrounds it.
 *
 * It replaced a mark with hard-coded orange/yellow gradients and a white
 * book stroke — the book vanished on light paper, and the gradients ignored
 * the visitor's vibe. currentColor fixes both, and makes the header and the
 * landing one identity.
 */
export function ReadriseLogo({ className = "" }: { className?: string }) {
  return <Wordmark className={`text-ink-100 ${className}`} />;
}
