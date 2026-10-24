import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Inside a circle, the header names it and offers its two rooms. The current
 * room is marked with the series-colour rule, the same as AppNav, so "where
 * am I" is answered the same way everywhere.
 */
export function CircleNav({
  slug,
  name,
  active,
}: {
  slug: string;
  name: string;
  active: "books" | "vault";
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="hidden text-ink-600 sm:inline" aria-hidden="true">/</span>
      <Link
        href={`/circles/${slug}`}
        className="cover-label min-w-0 truncate text-sm font-bold text-ink-100 hover:underline"
      >
        {name}
      </Link>
      <nav aria-label={`${name} sections`} className="flex items-center">
        {(
          [
            ["books", "Books", `/circles/${slug}`],
            ["vault", "Vault", `/circles/${slug}/vault`],
          ] as const
        ).map(([key, label, href]) => {
          const on = active === key;
          return (
            <Link
              key={key}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "cover-label relative px-2.5 py-2 text-sm font-semibold transition-colors duration-[120ms]",
                on ? "text-ink-100" : "text-ink-500 hover:text-ink-200"
              )}
            >
              {label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-2.5 bottom-0 h-[3px] bg-series transition-transform duration-[240ms] ease-[var(--ease-out)] sm:-bottom-[11px]",
                  on ? "scale-x-100" : "scale-x-0"
                )}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
