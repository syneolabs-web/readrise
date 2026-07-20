"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      // whitespace-nowrap: at narrow widths this wrapped to two lines and
      // pushed the header taller than its own row.
      className="whitespace-nowrap text-xs text-ink-500 transition-colors hover:text-ink-200"
    >
      Sign out
    </button>
  );
}
