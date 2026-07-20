"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Bottom tab bar for phones.
 *
 * The header nav is `hidden sm:flex`, which meant a phone had no way to reach
 * Discover or Profile at all — you could log in and then only ever see the
 * dashboard. A bottom bar is the right shape here rather than a hamburger:
 * there are exactly three destinations, they're the same on every screen, and
 * thumb reach at the bottom of a phone beats a menu at the top.
 *
 * Hidden at sm+ where the header nav takes over. Pages add bottom padding via
 * `pb-20 sm:pb-0` so the bar never covers the last row of content.
 */

const TABS = [
  { href: "/circles", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/profile", label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/95 backdrop-blur sm:hidden"
      // Keeps the bar clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex">
        {TABS.map((t) => {
          // Prefix match so /circles/growth-mindset still lights up Home.
          const active =
            t.href === "/circles"
              ? pathname === "/circles" || pathname.startsWith("/circles/")
              : pathname.startsWith(t.href);

          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-2xs font-medium transition-colors",
                  active ? "text-accent" : "text-ink-500"
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    active ? "bg-accent" : "bg-transparent"
                  )}
                  aria-hidden
                />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
