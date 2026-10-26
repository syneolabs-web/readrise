import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The three top-level destinations, as set in the header from `sm` up
 * (MobileNav carries them on phones). It was copy-pasted into each page with
 * slightly different classes; one component keeps the three in step.
 *
 * The current page is marked the way a book marks its running section: a
 * rule in the series colour under the word, not a filled pill.
 */
const ITEMS = [
  { key: "home", href: "/circles", label: "Home" },
  { key: "discover", href: "/discover", label: "Discover" },
  { key: "profile", href: "/profile", label: "Profile" },
] as const;

export function AppNav({ active }: { active: (typeof ITEMS)[number]["key"] }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
      {ITEMS.map((item) => {
        const on = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "cover-label relative px-2.5 py-2 text-sm font-semibold transition-colors duration-[120ms]",
              on ? "text-ink-100" : "text-ink-500 hover:text-ink-200"
            )}
          >
            {item.label}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-2.5 -bottom-[11px] h-[3px] rounded-full bg-series shadow-sm transition-transform duration-[240ms] ease-[var(--ease-out)]",
                on ? "scale-x-100" : "scale-x-0"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
