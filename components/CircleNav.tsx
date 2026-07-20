import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <span className="text-ink-700">/</span>
      <span className="truncate text-sm text-ink-400">{name}</span>
      <nav className="flex items-center gap-1">
        {(
          [
            ["books", "Books", `/circles/${slug}`],
            ["vault", "Vault", `/circles/${slug}/vault`],
          ] as const
        ).map(([key, label, href]) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
              active === key
                ? "bg-ink-800 text-ink-100"
                : "text-ink-500 hover:bg-ink-900 hover:text-ink-300"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
